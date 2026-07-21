"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)();
const isProduction = process.env.NODE_ENV === 'production';
const ext = isProduction ? '.js' : '{.ts,.js}';
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: !process.env.DATABASE_URL ? process.env.DB_HOST : undefined,
    port: !process.env.DATABASE_URL
        ? parseInt(process.env.DB_PORT || '5432', 10)
        : undefined,
    username: !process.env.DATABASE_URL ? process.env.DB_USER : undefined,
    password: !process.env.DATABASE_URL ? process.env.DB_PASSWORD : undefined,
    database: !process.env.DATABASE_URL ? process.env.DB_NAME : undefined,
    entities: [(0, path_1.join)(__dirname, `../**/*.entity${ext}`)],
    migrations: [(0, path_1.join)(__dirname, `./migrations/*${ext}`)],
    synchronize: false,
    logging: true,
    ssl: process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: false,
        }
        : false,
});
//# sourceMappingURL=data-source.js.map