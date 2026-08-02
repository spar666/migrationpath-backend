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
exports.Nomination = void 0;
const typeorm_1 = require("typeorm");
const sponsor_entity_1 = require("./sponsor.entity");
let Nomination = class Nomination {
    id;
    sponsor_id;
    occupation_code;
    occupation_name;
    subclass;
    annual_salary;
    work_state;
    work_postcode;
    is_regional;
    lmt_completed;
    status;
    applicant_prospect_id;
    raw_answers;
    created_at;
    updated_at;
    sponsor;
};
exports.Nomination = Nomination;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Nomination.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Nomination.prototype, "sponsor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 12, nullable: true }),
    __metadata("design:type", String)
], Nomination.prototype, "occupation_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Nomination.prototype, "occupation_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 8, nullable: true }),
    __metadata("design:type", String)
], Nomination.prototype, "subclass", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Nomination.prototype, "annual_salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Nomination.prototype, "work_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Nomination.prototype, "work_postcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], Nomination.prototype, "is_regional", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], Nomination.prototype, "lmt_completed", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 16, default: 'draft' }),
    __metadata("design:type", String)
], Nomination.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", Object)
], Nomination.prototype, "applicant_prospect_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Nomination.prototype, "raw_answers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Nomination.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Nomination.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sponsor_entity_1.Sponsor, (sponsor) => sponsor.nominations, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'sponsor_id' }),
    __metadata("design:type", sponsor_entity_1.Sponsor)
], Nomination.prototype, "sponsor", void 0);
exports.Nomination = Nomination = __decorate([
    (0, typeorm_1.Entity)('nominations')
], Nomination);
//# sourceMappingURL=nomination.entity.js.map