"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MigrationStatusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationStatusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let MigrationStatusService = MigrationStatusService_1 = class MigrationStatusService {
    dataSource;
    logger = new common_1.Logger(MigrationStatusService_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onApplicationBootstrap() {
        try {
            const discovered = this.dataSource.migrations.length;
            if (discovered === 0) {
                this.logger.error('No migration files were found. The schema is NOT being kept up to ' +
                    'date, and any code expecting a recently added column will fail ' +
                    'at runtime. Check the `migrations` glob in database.module.ts.');
                return;
            }
            const pending = await this.dataSource.showMigrations();
            if (pending) {
                this.logger.error(`${discovered} migration file(s) found, and some have NOT been ` +
                    'applied. Run `npm run migration:run`. Code that depends on the ' +
                    'newer columns will fail until you do.');
                return;
            }
            this.logger.log(`Schema is up to date (${discovered} migrations).`);
        }
        catch (error) {
            this.logger.warn(`Could not verify migration status: ${error.message}`);
        }
    }
};
exports.MigrationStatusService = MigrationStatusService;
exports.MigrationStatusService = MigrationStatusService = MigrationStatusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], MigrationStatusService);
//# sourceMappingURL=migration-status.service.js.map