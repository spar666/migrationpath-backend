import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

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
        entities: [__dirname + '/../**/*.entity.js'],
        migrations: [__dirname + '/migrations/*.js'],
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
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
