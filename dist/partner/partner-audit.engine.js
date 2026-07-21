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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerAuditEngine = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const partner_audit_entity_1 = require("./entities/partner-audit.entity");
const partner_profile_dto_1 = require("./dto/partner-profile.dto");
const policy_config_service_1 = require("../policy-config/policy-config.service");
const num = policy_config_service_1.PolicyConfigService.num;
let PartnerAuditEngine = class PartnerAuditEngine {
    auditRepository;
    policyConfig;
    constructor(auditRepository, policyConfig) {
        this.auditRepository = auditRepository;
        this.policyConfig = policyConfig;
    }
    async calculatePartnerReadiness(profile) {
        const cfg = await this.policyConfig.snapshot();
        const pillarMax = num(cfg, 'partner.pillarMax', 100);
        const weakThreshold = num(cfg, 'partner.weakThreshold', 75);
        const form888Required = num(cfg, 'partner.form888Required', 2);
        const cap = (value) => Math.max(0, Math.min(value, pillarMax));
        const p = {
            jointBankAccounts: !!profile.jointBankAccounts,
            jointLeaseOrMortgage: !!profile.jointLeaseOrMortgage,
            sharedUtilityBills: !!profile.sharedUtilityBills,
            sharedDomesticBills: !!profile.sharedDomesticBills,
            jointChildResponsibility: !!profile.jointChildResponsibility,
            matchingAddressHistory: !!profile.matchingAddressHistory,
            sharedTravelItineraries: !!profile.sharedTravelItineraries,
            form888Count: profile.form888Count ?? 0,
            jointSocialInvitations: !!profile.jointSocialInvitations,
            livedTogether12Months: !!profile.livedTogether12Months,
            registeredRelationshipBDM: !!profile.registeredRelationshipBDM,
        };
        const financialScore = cap((p.jointBankAccounts ? num(cfg, 'partner.jointBankAccounts', 30) : 0) +
            (p.jointLeaseOrMortgage ? num(cfg, 'partner.jointLeaseOrMortgage', 40) : 0) +
            (p.sharedUtilityBills ? num(cfg, 'partner.sharedUtilityBills', 30) : 0));
        const householdScore = cap((p.sharedDomesticBills ? num(cfg, 'partner.sharedDomesticBills', 40) : 0) +
            (p.jointChildResponsibility ? num(cfg, 'partner.jointChildResponsibility', 30) : 0) +
            (p.matchingAddressHistory ? num(cfg, 'partner.matchingAddressHistory', 30) : 0));
        const hasForm888 = p.form888Count >= form888Required;
        const socialScore = cap((p.sharedTravelItineraries ? num(cfg, 'partner.sharedTravelItineraries', 30) : 0) +
            (hasForm888 ? num(cfg, 'partner.form888Points', 40) : 0) +
            (p.jointSocialInvitations ? num(cfg, 'partner.jointSocialInvitations', 30) : 0));
        const commitmentScore = cap((p.livedTogether12Months ? num(cfg, 'partner.livedTogether12Months', 50) : 0) +
            (p.registeredRelationshipBDM ? num(cfg, 'partner.registeredRelationshipBDM', 50) : 0));
        const legislativeWaiverApplied = !p.livedTogether12Months && p.registeredRelationshipBDM;
        const commitmentStatus = legislativeWaiverApplied
            ? 'LEGALLY UNLOCKED'
            : 'STANDARD';
        const pillars = [
            { key: 'financial', label: 'Financial Aspects', score: financialScore, percentage: financialScore, status: 'STANDARD' },
            { key: 'household', label: 'Nature of Household', score: householdScore, percentage: householdScore, status: 'STANDARD' },
            { key: 'social', label: 'Social Aspects', score: socialScore, percentage: socialScore, status: 'STANDARD' },
            { key: 'commitment', label: 'Commitment Aspects', score: commitmentScore, percentage: commitmentScore, status: commitmentStatus },
        ];
        const overallReadiness = Math.round(pillars.reduce((sum, pillar) => sum + pillar.percentage, 0) /
            pillars.length);
        const predictedVisa = this.resolveVisaPath(profile.currentLocation);
        const recommendations = this.buildRecommendations(p, { financialScore, householdScore, socialScore, commitmentScore }, legislativeWaiverApplied, weakThreshold, form888Required);
        const entity = this.auditRepository.create({
            currentLocation: profile.currentLocation,
            jointBankAccounts: p.jointBankAccounts,
            jointLeaseOrMortgage: p.jointLeaseOrMortgage,
            sharedUtilityBills: p.sharedUtilityBills,
            sharedDomesticBills: p.sharedDomesticBills,
            jointChildResponsibility: p.jointChildResponsibility,
            matchingAddressHistory: p.matchingAddressHistory,
            sharedTravelItineraries: p.sharedTravelItineraries,
            form888Count: p.form888Count,
            jointSocialInvitations: p.jointSocialInvitations,
            livedTogether12Months: p.livedTogether12Months,
            registeredRelationshipBDM: p.registeredRelationshipBDM,
            overallReadiness,
            financialScore,
            householdScore,
            socialScore,
            commitmentScore,
            commitmentStatus,
            legislativeWaiverApplied,
            predictedSubclass: predictedVisa.subclass,
            recommendations,
        });
        const saved = await this.auditRepository.save(entity);
        return {
            auditId: saved.id,
            overallReadiness,
            pillars,
            predictedVisa,
            legislativeWaiverApplied,
            commitmentStatus,
            recommendations,
        };
    }
    resolveVisaPath(location) {
        if (location === partner_profile_dto_1.ApplicantLocation.ONSHORE) {
            return { subclass: '820', name: 'Partner visa (Onshore, 820/801)', location: 'onshore' };
        }
        return { subclass: '309', name: 'Partner visa (Offshore, 309/100)', location: 'offshore' };
    }
    buildRecommendations(p, scores, legislativeWaiverApplied, weakThreshold, form888Required) {
        const recs = [];
        if (scores.financialScore < weakThreshold) {
            if (!p.jointLeaseOrMortgage)
                recs.push('Financial: add both partners to a lease or mortgage — joint property commitments are the strongest financial evidence.');
            if (!p.jointBankAccounts)
                recs.push('Financial: open a joint bank account and use it for shared expenses to demonstrate pooled finances.');
            if (!p.sharedUtilityBills)
                recs.push('Financial: put utility accounts in both names, or retain bills showing shared liability.');
        }
        if (scores.householdScore < weakThreshold) {
            if (!p.sharedDomesticBills)
                recs.push('Household: keep records of shared domestic bills and how household costs are divided between you.');
            if (!p.matchingAddressHistory)
                recs.push('Household: build a consistent shared address history (licences, mail, electoral roll) at the same residence.');
            if (!p.jointChildResponsibility)
                recs.push('Household: if you share care of children, document joint responsibility (school records, medical, guardianship).');
        }
        if (scores.socialScore < weakThreshold) {
            if (p.form888Count < form888Required)
                recs.push(`Social: obtain at least ${form888Required} Form 888 statutory declarations from Australian citizens or permanent residents (you currently have ${p.form888Count}).`);
            if (!p.sharedTravelItineraries)
                recs.push('Social: keep joint travel itineraries and booking records showing you travel together.');
            if (!p.jointSocialInvitations)
                recs.push('Social: retain invitations and evidence addressed to you as a couple to show you are recognised socially.');
        }
        if (legislativeWaiverApplied) {
            recs.push('Commitment: your BDM-registered relationship satisfies the 12-month cohabitation requirement — the low-cohabitation risk is waived. Keep the registration certificate accessible.');
        }
        else if (scores.commitmentScore < weakThreshold) {
            if (!p.livedTogether12Months && !p.registeredRelationshipBDM) {
                recs.push('Commitment: you have neither 12+ months of cohabitation nor a registered relationship. Register your de facto relationship with a State/Territory BDM to legally satisfy the cohabitation requirement.');
            }
            else if (!p.livedTogether12Months) {
                recs.push('Commitment: strengthen the commitment pillar with evidence of shared living arrangements approaching 12 months.');
            }
        }
        if (recs.length === 0) {
            recs.push('Your evidence is strong across all four pillars. Focus on organising and certifying documents ahead of lodgement.');
        }
        return recs;
    }
};
exports.PartnerAuditEngine = PartnerAuditEngine;
exports.PartnerAuditEngine = PartnerAuditEngine = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(partner_audit_entity_1.PartnerAudit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        policy_config_service_1.PolicyConfigService])
], PartnerAuditEngine);
//# sourceMappingURL=partner-audit.engine.js.map