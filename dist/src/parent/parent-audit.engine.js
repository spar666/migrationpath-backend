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
exports.ParentAuditEngine = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const parent_audit_entity_1 = require("./entities/parent-audit.entity");
const parent_profile_dto_1 = require("./dto/parent-profile.dto");
const policy_config_service_1 = require("../policy-config/policy-config.service");
const num = policy_config_service_1.PolicyConfigService.num;
const ELIGIBLE_SPONSOR_STATUSES = new Set([
    parent_profile_dto_1.SponsorStatus.CITIZEN,
    parent_profile_dto_1.SponsorStatus.PERMANENT_RESIDENT,
    parent_profile_dto_1.SponsorStatus.ELIGIBLE_NZ,
]);
let ParentAuditEngine = class ParentAuditEngine {
    auditRepository;
    policyConfig;
    constructor(auditRepository, policyConfig) {
        this.auditRepository = auditRepository;
        this.policyConfig = policyConfig;
    }
    async calculateParentEligibility(profile) {
        const cfg = await this.policyConfig.snapshot();
        const sponsorMinMonths = num(cfg, 'parent.sponsorMinMonths', 24);
        const balanceThreshold = num(cfg, 'parent.balanceThresholdPct', 50) / 100;
        const aosBenchmark = num(cfg, 'parent.aosSingleBenchmark', 65000);
        const agePensionAge = num(cfg, 'parent.agePensionAge', 67);
        const recommendations = [];
        const sponsorCheck = this.evaluateSponsor(profile, sponsorMinMonths);
        if (!sponsorCheck.pass && sponsorCheck.reason) {
            recommendations.push(sponsorCheck.reason);
        }
        const balanceOfFamily = this.evaluateBalanceOfFamily(profile, balanceThreshold);
        if (!this.balancePasses(balanceOfFamily) && balanceOfFamily.reason) {
            recommendations.push(balanceOfFamily.reason);
        }
        const aos = this.evaluateAos(profile, aosBenchmark);
        if (aos.warning)
            recommendations.push(aos.warning);
        const isEligible = sponsorCheck.pass && this.balancePasses(balanceOfFamily);
        const status = isEligible
            ? 'LEGALLY_ELIGIBLE'
            : 'LEGALLY_INELIGIBLE';
        const predictedVisa = this.resolveVisaPath(profile.parentAge, agePensionAge);
        if (isEligible) {
            recommendations.push(`Based on your age, the likely pathway is the ${predictedVisa.name}. A registered migration agent can confirm the best fit and current queue/processing times.`);
            if (!aos.warning) {
                recommendations.push('Your sponsor currently meets the indicative Assurance of Support income baseline. Keep evidence of income current through to assessment.');
            }
        }
        const entity = this.auditRepository.create({
            sponsorStatus: profile.sponsorStatus,
            sponsorMonthsInAustralia: profile.sponsorMonthsInAustralia,
            totalChildren: profile.totalChildren,
            childrenInAustralia: profile.childrenInAustralia,
            childrenInLargestOtherCountry: profile.childrenInLargestOtherCountry ?? 0,
            sponsorTaxableIncome: profile.sponsorTaxableIncome,
            parentAge: profile.parentAge,
            isEligible,
            status,
            balancePercentage: balanceOfFamily.percentage,
            balancePass: this.balancePasses(balanceOfFamily),
            sponsorCheckPass: sponsorCheck.pass,
            aosMeetsBenchmark: aos.meetsBenchmark,
            requiresCoAssurer: aos.requiresCoAssurer,
            predictedSubclass: predictedVisa.subclass,
            recommendations,
        });
        const saved = await this.auditRepository.save(entity);
        return {
            auditId: saved.id,
            isEligible,
            status,
            balanceOfFamily,
            sponsorCheck,
            aos,
            predictedVisa,
            recommendations,
        };
    }
    evaluateSponsor(profile, sponsorMinMonths) {
        const statusEligible = ELIGIBLE_SPONSOR_STATUSES.has(profile.sponsorStatus);
        const residencyEligible = profile.sponsorMonthsInAustralia >= sponsorMinMonths;
        if (!statusEligible) {
            return {
                pass: false,
                reason: 'Sponsor Gate: the sponsoring child must be an Australian citizen, permanent resident, or eligible New Zealand citizen. On the details provided, they are not yet an eligible sponsor.',
            };
        }
        if (!residencyEligible) {
            return {
                pass: false,
                reason: `Sponsor Gate: the sponsoring child must be usually resident in Australia for at least ${sponsorMinMonths} months (currently ${profile.sponsorMonthsInAustralia}). Sponsorship may need to wait until this is met, or an eligible-relative sponsor may be substituted.`,
            };
        }
        return { pass: true };
    }
    evaluateBalanceOfFamily(profile, balanceThreshold) {
        const total = Math.max(0, profile.totalChildren);
        const inAus = Math.min(Math.max(0, profile.childrenInAustralia), total);
        const largestOther = Math.max(0, profile.childrenInLargestOtherCountry ?? 0);
        const ratio = total > 0 ? inAus / total : 0;
        const percentage = Math.round(ratio * 100);
        const halfLimbPass = total > 0 && ratio >= balanceThreshold;
        const alternativeLimbPass = total > 0 && inAus > largestOther;
        const pass = halfLimbPass || alternativeLimbPass;
        let reason;
        if (!pass) {
            reason =
                total === 0
                    ? 'Balance of Family Gate: no children were recorded, so the test cannot be satisfied.'
                    : `Balance of Family Gate: only ${inAus} of ${total} children (${percentage}%) are permanently in Australia. The parent visa requires at least ${Math.round(balanceThreshold * 100)}% of children in Australia, or more children in Australia than in any other single country. This mathematical requirement is not currently met.`;
        }
        return {
            childrenInAustralia: inAus,
            totalChildren: total,
            percentage,
            pass: halfLimbPass,
            alternativeLimbPass,
            reason,
        };
    }
    balancePasses(result) {
        return result.pass || result.alternativeLimbPass;
    }
    evaluateAos(profile, benchmark) {
        const meetsBenchmark = profile.sponsorTaxableIncome >= benchmark;
        return {
            sponsorTaxableIncome: profile.sponsorTaxableIncome,
            benchmark,
            meetsBenchmark,
            requiresCoAssurer: !meetsBenchmark,
            warning: meetsBenchmark
                ? undefined
                : `Assurance of Support: the sponsor's taxable income (AUD ${profile.sponsorTaxableIncome.toLocaleString()}) is below the indicative single-sponsor baseline of AUD ${benchmark.toLocaleString()}. A co-assurer will likely be required to meet Centrelink's Assurance of Support bond requirements.`,
        };
    }
    resolveVisaPath(parentAge, agePensionAge) {
        if (parentAge >= agePensionAge) {
            return {
                subclass: '804',
                name: 'Aged Parent visa (Subclass 804)',
                track: 'aged_parent',
            };
        }
        return {
            subclass: '143',
            name: 'Contributory Parent visa (Subclass 143)',
            track: 'contributory_parent',
        };
    }
};
exports.ParentAuditEngine = ParentAuditEngine;
exports.ParentAuditEngine = ParentAuditEngine = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(parent_audit_entity_1.ParentAudit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        policy_config_service_1.PolicyConfigService])
], ParentAuditEngine);
//# sourceMappingURL=parent-audit.engine.js.map