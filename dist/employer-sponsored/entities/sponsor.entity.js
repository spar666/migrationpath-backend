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
exports.Sponsor = void 0;
const typeorm_1 = require("typeorm");
const nomination_entity_1 = require("./nomination.entity");
let Sponsor = class Sponsor {
    id;
    prospect_id;
    legal_name;
    trading_name;
    abn;
    industry;
    employee_count;
    years_trading;
    state;
    postcode;
    sponsorship_status;
    has_adverse_information;
    meets_training_obligations;
    raw_answers;
    created_at;
    updated_at;
    nominations;
};
exports.Sponsor = Sponsor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Sponsor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Sponsor.prototype, "prospect_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Sponsor.prototype, "legal_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Sponsor.prototype, "trading_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Sponsor.prototype, "abn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Sponsor.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Sponsor.prototype, "employee_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Sponsor.prototype, "years_trading", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Sponsor.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Sponsor.prototype, "postcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 24, default: 'unknown' }),
    __metadata("design:type", String)
], Sponsor.prototype, "sponsorship_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], Sponsor.prototype, "has_adverse_information", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], Sponsor.prototype, "meets_training_obligations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Sponsor.prototype, "raw_answers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Sponsor.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Sponsor.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => nomination_entity_1.Nomination, (nomination) => nomination.sponsor),
    __metadata("design:type", Array)
], Sponsor.prototype, "nominations", void 0);
exports.Sponsor = Sponsor = __decorate([
    (0, typeorm_1.Entity)('sponsors')
], Sponsor);
//# sourceMappingURL=sponsor.entity.js.map