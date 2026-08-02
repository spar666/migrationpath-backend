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
exports.Prospect = void 0;
const typeorm_1 = require("typeorm");
let Prospect = class Prospect {
    id;
    human_ref;
    party;
    full_name;
    email;
    phone;
    company_name;
    stage;
    statutory_eligible;
    client_fit;
    source;
    visa_interest;
    consent_given;
    consent_text;
    consent_at;
    user_id;
    sponsor_id;
    agent_notes;
    created_at;
    updated_at;
};
exports.Prospect = Prospect;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Prospect.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ length: 16 }),
    __metadata("design:type", String)
], Prospect.prototype, "human_ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 16, default: 'applicant' }),
    __metadata("design:type", String)
], Prospect.prototype, "party", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Prospect.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Prospect.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Prospect.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Prospect.prototype, "company_name", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 24, default: 'captured' }),
    __metadata("design:type", String)
], Prospect.prototype, "stage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], Prospect.prototype, "statutory_eligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], Prospect.prototype, "client_fit", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 48, default: 'unknown' }),
    __metadata("design:type", String)
], Prospect.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Prospect.prototype, "visa_interest", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Prospect.prototype, "consent_given", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Prospect.prototype, "consent_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Prospect.prototype, "consent_at", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", Object)
], Prospect.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", Object)
], Prospect.prototype, "sponsor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Prospect.prototype, "agent_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Prospect.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Prospect.prototype, "updated_at", void 0);
exports.Prospect = Prospect = __decorate([
    (0, typeorm_1.Entity)('prospects')
], Prospect);
//# sourceMappingURL=prospect.entity.js.map