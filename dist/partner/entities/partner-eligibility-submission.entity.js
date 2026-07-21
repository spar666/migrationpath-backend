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
exports.PartnerEligibilitySubmission = void 0;
const typeorm_1 = require("typeorm");
let PartnerEligibilitySubmission = class PartnerEligibilitySubmission {
    id;
    applicantFirstName;
    sponsorFirstName;
    completedBy;
    email;
    applicantCountry;
    relationshipStatus;
    outcome;
    summary;
    effort;
    highRisk;
    becomingEligible;
    answers;
    created_at;
};
exports.PartnerEligibilitySubmission = PartnerEligibilitySubmission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'applicant_first_name', type: 'varchar' }),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "applicantFirstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sponsor_first_name', type: 'varchar' }),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "sponsorFirstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_by', type: 'varchar' }),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "completedBy", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_partner_eligibility_email'),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'applicant_country', type: 'varchar' }),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "applicantCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'relationship_status', type: 'varchar' }),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "relationshipStatus", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_partner_eligibility_outcome'),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PartnerEligibilitySubmission.prototype, "effort", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'high_risk', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerEligibilitySubmission.prototype, "highRisk", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'becoming_eligible', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerEligibilitySubmission.prototype, "becomingEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], PartnerEligibilitySubmission.prototype, "answers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PartnerEligibilitySubmission.prototype, "created_at", void 0);
exports.PartnerEligibilitySubmission = PartnerEligibilitySubmission = __decorate([
    (0, typeorm_1.Entity)('partner_eligibility_submissions')
], PartnerEligibilitySubmission);
//# sourceMappingURL=partner-eligibility-submission.entity.js.map