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
exports.OccupationVisa = void 0;
const typeorm_1 = require("typeorm");
const occupation_entity_1 = require("./occupation.entity");
const visa_entity_1 = require("./visa.entity");
let OccupationVisa = class OccupationVisa {
    id;
    occupation_anzsco_code;
    visa_id;
    caveats;
    is_active;
    created_at;
    updated_at;
    occupation;
    visa;
};
exports.OccupationVisa = OccupationVisa;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OccupationVisa.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_occupation_visas_anzsco'),
    (0, typeorm_1.Column)({ name: 'occupation_anzsco_code', type: 'varchar', length: 6 }),
    __metadata("design:type", String)
], OccupationVisa.prototype, "occupation_anzsco_code", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_occupation_visas_visa_id'),
    (0, typeorm_1.Column)({ name: 'visa_id', type: 'uuid' }),
    __metadata("design:type", String)
], OccupationVisa.prototype, "visa_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], OccupationVisa.prototype, "caveats", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], OccupationVisa.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OccupationVisa.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], OccupationVisa.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => occupation_entity_1.Occupation, (occupation) => occupation.occupationVisas, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'occupation_anzsco_code',
        referencedColumnName: 'anzsco_code',
    }),
    __metadata("design:type", occupation_entity_1.Occupation)
], OccupationVisa.prototype, "occupation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visa_entity_1.Visa, (visa) => visa.occupationVisas, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'visa_id' }),
    __metadata("design:type", visa_entity_1.Visa)
], OccupationVisa.prototype, "visa", void 0);
exports.OccupationVisa = OccupationVisa = __decorate([
    (0, typeorm_1.Entity)('occupation_visas'),
    (0, typeorm_1.Unique)('UQ_occupation_visa', ['occupation_anzsco_code', 'visa_id'])
], OccupationVisa);
//# sourceMappingURL=occupation-visa.entity.js.map