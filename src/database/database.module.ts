import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MigrationStatusService } from './migration-status.service';

/**
 * Which files the entity and migration globs should match.
 *
 * A compiled build has only `.js`. A `nest start` dev run executes the
 * TypeScript directly, so a `.js`-only glob finds nothing at all — and TypeORM
 * treats "no migrations found" as "nothing to do", not as a problem.
 */
const sourceExtensions =
  process.env.NODE_ENV === 'production' ? '.js' : '{.ts,.js}';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        // `.js` ONLY was a silent no-op outside production. Under `nest start`
        // the source is TypeScript, `__dirname` points into `src/`, and a `.js`
        // glob matches nothing — so `migrationsRun: true` faithfully ran zero
        // migrations and reported success. Nobody noticed while the schema
        // happened to match; the moment code depended on a new column, every
        // request touching it failed with "column does not exist" and the cause
        // was two files away from the symptom.
        //
        // Mirrors data-source.ts, which had this right — the two are the same
        // decision written twice, which is how they drifted.
        entities: [join(__dirname, `../**/*.entity${sourceExtensions}`)],
        migrations: [join(__dirname, `./migrations/*${sourceExtensions}`)],
        // Off on Vercel, where the `vercel-build` script already ran the
        // migrations against `dist/` at BUILD time — once, on one machine,
        // before any traffic.
        //
        // Leaving it on there is worse than redundant. @vercel/node traces the
        // files the code imports, and nothing imports a migration — they are
        // only ever found by the glob above — so what ships is whatever
        // `includeFiles` copies in, which is the `.ts` sources. The production
        // glob looks for `.js`. It matches nothing, TypeORM reports success
        // having done nothing, and MigrationStatusService logs its "no
        // migration files were found" error on every single cold start.
        //
        // The remaining risk is the one this replaces: several cold instances
        // starting at once and each running the set concurrently, which
        // `migrationsTransactionMode: 'each'` does not protect against.
        migrationsRun: process.env.VERCEL !== '1',
        migrationsTransactionMode: 'each',
        synchronize: false,
        logging: configService.get<string>('app.nodeEnv') !== 'production',
        ssl:
          configService.get<string>('database.ssl') === 'true'
            ? {
                rejectUnauthorized: false,
              }
            : false,
      }),
    }),
  ],
  providers: [MigrationStatusService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
