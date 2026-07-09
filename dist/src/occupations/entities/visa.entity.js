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
exports.Visa = void 0;
const typeorm_1 = require("typeorm");
const visa_mapping_1 = require("../constants/visa-mapping");
const occupation_visa_entity_1 = require("./occupation-visa.entity");
let Visa = class Visa {
    id;
    subclass_number;
    stream_title;
    residency_type;
    name;
    is_active;
    created_at;
    updated_at;
    occupationVisas;
};
exports.Visa = Visa;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Visa.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_visas_subclass_number', { unique: true }),
    (0, typeorm_1.Column)({ name: 'subclass_number', type: 'varchar', length: 16 }),
    __metadata("design:type", String)
], Visa.prototype, "subclass_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stream_title', type: 'varchar' }),
    __metadata("design:type", String)
], Visa.prototype, "stream_title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'residency_type',
        type: 'enum',
        enum: visa_mapping_1.VisaResidencyType,
    }),
    __metadata("design:type", String)
], Visa.prototype, "residency_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Visa.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Visa.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Visa.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Visa.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => occupation_visa_entity_1.OccupationVisa, (occupationVisa) => occupationVisa.visa),
    __metadata("design:type", Array)
], Visa.prototype, "occupationVisas", void 0);
exports.Visa = Visa = __decorate([
    (0, typeorm_1.Entity)('visas')
], Visa);
//# sourceMappingURL=visa.entity.js.map