import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Says out loud whether the schema is up to date.
 *
 * `migrationsRun: true` is not the guarantee it looks like. If the glob that
 * finds migration files matches nothing — which it did outside production for
 * as long as anyone can remember, because it only looked for `.js` while dev
 * runs `.ts` — TypeORM finds no migrations, concludes there is nothing to do,
 * and starts cleanly. The schema silently stays behind the code.
 *
 * Nothing goes wrong until some code depends on a column that was never added.
 * Then every request touching it fails with "column does not exist", and the
 * cause is a glob in a file nobody was looking at. That happened here: the
 * webhook idempotency work added columns, the migrations never ran, and every
 * Stripe delivery started failing.
 *
 * This turns that into one line at boot.
 */
@Injectable()
export class MigrationStatusService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationStatusService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      // On Vercel the runtime has no migration FILES to find, by design — see
      // the `migrationsRun` comment in database.module.ts. The file-based check
      // below would fire its loudest error on every cold start and mean
      // nothing, so ask the database what it has applied instead.
      if (process.env.VERCEL === '1') {
        await this.reportAppliedMigrations();
        return;
      }

      const discovered = this.dataSource.migrations.length;

      // The glob matched nothing. Distinct from "all migrations are applied",
      // and the two are indistinguishable from `showMigrations()` alone.
      if (discovered === 0) {
        this.logger.error(
          'No migration files were found. The schema is NOT being kept up to ' +
            'date, and any code expecting a recently added column will fail ' +
            'at runtime. Check the `migrations` glob in database.module.ts.',
        );
        return;
      }

      const pending = await this.dataSource.showMigrations();

      if (pending) {
        // Reached only if migrationsRun did not apply them — a failure part
        // way through the set, or migrationsRun switched off.
        this.logger.error(
          `${discovered} migration file(s) found, and some have NOT been ` +
            'applied. Run `npm run migration:run`. Code that depends on the ' +
            'newer columns will fail until you do.',
        );
        return;
      }

      this.logger.log(`Schema is up to date (${discovered} migrations).`);
    } catch (error) {
      // Never fatal. A database that cannot answer this question has bigger
      // problems, and they will surface with a better message elsewhere.
      this.logger.warn(
        `Could not verify migration status: ${(error as Error).message}`,
      );
    }
  }

  /**
   * What the DATABASE says has been applied, for the deployment where the
   * files are not present to compare against.
   *
   * This cannot tell you the schema is up to date with the code — only the
   * build that ran `migration:run` knows that. What it can catch is the
   * failure that matters most and is otherwise silent: an empty or missing
   * migrations table, meaning `vercel-build` never applied anything and the
   * schema is whatever it was before this deploy.
   */
  private async reportAppliedMigrations(): Promise<void> {
    const rows = await this.dataSource.query<Array<{ name: string }>>(
      'SELECT name FROM migrations ORDER BY timestamp DESC LIMIT 1',
    );

    if (rows.length === 0) {
      this.logger.error(
        'The migrations table is empty. Nothing has ever been applied to this ' +
          'database, so the schema is almost certainly behind the code. Check ' +
          'that the `vercel-build` script succeeded on the last deploy.',
      );
      return;
    }

    this.logger.log(
      `Schema last migrated by "${rows[0].name}" (applied at build time; the ` +
        `runtime does not carry migration files on Vercel).`,
    );
  }
}
