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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteConfig = void 0;
const typeorm_1 = require("typeorm");
let SiteConfig = class SiteConfig {
    id;
    configKey;
    configData;
    updatedBy;
    created_at;
    updated_at;
};
exports.SiteConfig = SiteConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SiteConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_site_config_key', { unique: true }),
    (0, typeorm_1.Column)({ name: 'config_key', type: 'varchar', default: "'site_config'" }),
    __metadata("design:type", String)
], SiteConfig.prototype, "configKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'config_data', type: 'jsonb' }),
    __metadata("design:type", Object)
], SiteConfig.prototype, "configData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], SiteConfig.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SiteConfig.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SiteConfig.prototype, "updated_at", void 0);
exports.SiteConfig = SiteConfig = __decorate([
    (0, typeorm_1.Entity)('site_config')
], SiteConfig);
//# sourceMappingURL=site-config.entity.js.map