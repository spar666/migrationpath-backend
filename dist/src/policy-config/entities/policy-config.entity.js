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
exports.PolicyConfig = void 0;
const typeorm_1 = require("typeorm");
let PolicyConfig = class PolicyConfig {
    id;
    configKey;
    numericValue;
    label;
    description;
    category;
    unit;
    sourceNote;
    effectiveDate;
    updated_at;
};
exports.PolicyConfig = PolicyConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PolicyConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_policy_config_key', { unique: true }),
    (0, typeorm_1.Column)({ name: 'config_key', type: 'varchar' }),
    __metadata("design:type", String)
], PolicyConfig.prototype, "configKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numeric_value', type: 'double precision' }),
    __metadata("design:type", Number)
], PolicyConfig.prototype, "numericValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PolicyConfig.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PolicyConfig.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_policy_config_category'),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PolicyConfig.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], PolicyConfig.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_note', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PolicyConfig.prototype, "sourceNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], PolicyConfig.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PolicyConfig.prototype, "updated_at", void 0);
exports.PolicyConfig = PolicyConfig = __decorate([
    (0, typeorm_1.Entity)('policy_config')
], PolicyConfig);
//# sourceMappingURL=policy-config.entity.js.map