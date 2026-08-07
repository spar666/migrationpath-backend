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
exports.DataSourceMeta = void 0;
const typeorm_1 = require("typeorm");
let DataSourceMeta = class DataSourceMeta {
    id;
    domain;
    label;
    lastVerifiedAt;
    reviewIntervalDays;
    sourceUrl;
    notes;
    adminRoute;
    updated_at;
};
exports.DataSourceMeta = DataSourceMeta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DataSourceMeta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_data_source_domain', { unique: true }),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], DataSourceMeta.prototype, "domain", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], DataSourceMeta.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_verified_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], DataSourceMeta.prototype, "lastVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_interval_days', type: 'int', default: 90 }),
    __metadata("design:type", Number)
], DataSourceMeta.prototype, "reviewIntervalDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DataSourceMeta.prototype, "sourceUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DataSourceMeta.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_route', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], DataSourceMeta.prototype, "adminRoute", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DataSourceMeta.prototype, "updated_at", void 0);
exports.DataSourceMeta = DataSourceMeta = __decorate([
    (0, typeorm_1.Entity)('data_source_meta')
], DataSourceMeta);
//# sourceMappingURL=data-source-meta.entity.js.map