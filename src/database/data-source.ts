import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config(); // Load .env

const isProduction = process.env.NODE_ENV === 'production';
const ext = isProduction ? '.js' : '{.ts,.js}';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // Use full URL if available
  host: !process.env.DATABASE_URL ? process.env.DB_HOST : undefined,
  port: !process.env.DATABASE_URL
    ? parseInt(process.env.DB_PORT || '5432', 10)
    : undefined,
  username: !process.env.DATABASE_URL ? process.env.DB_USER : undefined,
  password: !process.env.DATABASE_URL ? process.env.DB_PASSWORD : undefined,
  database: !process.env.DATABASE_URL ? process.env.DB_NAME : undefined,
  entities: [join(__dirname, `../**/*.entity${ext}`)],
  migrations: [join(__dirname, `./migrations/*${ext}`)],
  synchronize: false,
  logging: true,
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
