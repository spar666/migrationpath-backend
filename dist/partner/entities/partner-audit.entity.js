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
exports.PartnerAudit = void 0;
const typeorm_1 = require("typeorm");
let PartnerAudit = class PartnerAudit {
    id;
    currentLocation;
    jointBankAccounts;
    jointLeaseOrMortgage;
    sharedUtilityBills;
    sharedDomesticBills;
    jointChildResponsibility;
    matchingAddressHistory;
    sharedTravelItineraries;
    form888Count;
    jointSocialInvitations;
    livedTogether12Months;
    registeredRelationshipBDM;
    overallReadiness;
    financialScore;
    householdScore;
    socialScore;
    commitmentScore;
    commitmentStatus;
    legislativeWaiverApplied;
    predictedSubclass;
    recommendations;
    created_at;
};
exports.PartnerAudit = PartnerAudit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PartnerAudit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_partner_audits_location'),
    (0, typeorm_1.Column)({ name: 'current_location', type: 'varchar' }),
    __metadata("design:type", String)
], PartnerAudit.prototype, "currentLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'joint_bank_accounts', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "jointBankAccounts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'joint_lease_or_mortgage', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "jointLeaseOrMortgage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shared_utility_bills', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "sharedUtilityBills", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shared_domestic_bills', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "sharedDomesticBills", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'joint_child_responsibility', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "jointChildResponsibility", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'matching_address_history', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "matchingAddressHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shared_travel_itineraries', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "sharedTravelItineraries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'form_888_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PartnerAudit.prototype, "form888Count", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'joint_social_invitations', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "jointSocialInvitations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lived_together_12_months', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "livedTogether12Months", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registered_relationship_bdm', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "registeredRelationshipBDM", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overall_readiness', type: 'int' }),
    __metadata("design:type", Number)
], PartnerAudit.prototype, "overallReadiness", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'financial_score', type: 'int' }),
    __metadata("design:type", Number)
], PartnerAudit.prototype, "financialScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'household_score', type: 'int' }),
    __metadata("design:type", Number)
], PartnerAudit.prototype, "householdScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'social_score', type: 'int' }),
    __metadata("design:type", Number)
], PartnerAudit.prototype, "socialScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commitment_score', type: 'int' }),
    __metadata("design:type", Number)
], PartnerAudit.prototype, "commitmentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commitment_status', type: 'varchar' }),
    __metadata("design:type", String)
], PartnerAudit.prototype, "commitmentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'legislative_waiver_applied', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerAudit.prototype, "legislativeWaiverApplied", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'predicted_subclass', type: 'varchar' }),
    __metadata("design:type", String)
], PartnerAudit.prototype, "predictedSubclass", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PartnerAudit.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PartnerAudit.prototype, "created_at", void 0);
exports.PartnerAudit = PartnerAudit = __decorate([
    (0, typeorm_1.Entity)('partner_audits')
], PartnerAudit);
//# sourceMappingURL=partner-audit.entity.js.map