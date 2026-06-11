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
exports.OccupationThreshold = exports.Occupation = void 0;
const typeorm_1 = require("typeorm");
let Occupation = class Occupation {
    id;
    occupation_name;
    anzsco_code;
    description;
    assessing_authority;
    points_value;
    created_at;
    updated_at;
    thresholds;
};
exports.Occupation = Occupation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Occupation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Occupation.prototype, "occupation_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Occupation.prototype, "anzsco_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Occupation.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Occupation.prototype, "assessing_authority", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], Occupation.prototype, "points_value", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Occupation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Occupation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OccupationThreshold, (threshold) => threshold.occupation),
    __metadata("design:type", Array)
], Occupation.prototype, "thresholds", void 0);
exports.Occupation = Occupation = __decorate([
    (0, typeorm_1.Entity)('occupations_list')
], Occupation);
let OccupationThreshold = class OccupationThreshold {
    id;
    occupation_id;
    state_code;
    min_points;
    is_available;
    created_at;
    updated_at;
    occupation;
};
exports.OccupationThreshold = OccupationThreshold;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OccupationThreshold.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], OccupationThreshold.prototype, "occupation_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OccupationThreshold.prototype, "state_code", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], OccupationThreshold.prototype, "min_points", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], OccupationThreshold.prototype, "is_available", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OccupationThreshold.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], OccupationThreshold.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Occupation, (occupation) => occupation.thresholds),
    (0, typeorm_1.JoinColumn)({ name: 'occupation_id' }),
    __metadata("design:type", Occupation)
], OccupationThreshold.prototype, "occupation", void 0);
exports.OccupationThreshold = OccupationThreshold = __decorate([
    (0, typeorm_1.Entity)('occupation_thresholds')
], OccupationThreshold);
//# sourceMappingURL=occupation.entity.js.map