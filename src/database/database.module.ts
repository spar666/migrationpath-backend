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
        migrationsRun: true,
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
