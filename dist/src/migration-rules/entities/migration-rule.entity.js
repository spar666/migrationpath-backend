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
exports.MigrationRule = void 0;
const typeorm_1 = require("typeorm");
let MigrationRule = class MigrationRule {
    id;
    persona_type;
    document_name;
    description;
    is_mandatory;
    created_at;
    updated_at;
};
exports.MigrationRule = MigrationRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MigrationRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'persona_type' }),
    __metadata("design:type", String)
], MigrationRule.prototype, "persona_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'document_name' }),
    __metadata("design:type", String)
], MigrationRule.prototype, "document_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MigrationRule.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_mandatory', default: true }),
    __metadata("design:type", Boolean)
], MigrationRule.prototype, "is_mandatory", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MigrationRule.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MigrationRule.prototype, "updated_at", void 0);
exports.MigrationRule = MigrationRule = __decorate([
    (0, typeorm_1.Entity)('migration_rules')
], MigrationRule);
//# sourceMappingURL=migration-rule.entity.js.map