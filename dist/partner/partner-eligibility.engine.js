"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerEligibilityEngine = void 0;
const common_1 = require("@nestjs/common");
const NO_MARRY = 'No, we would rather remain unmarried, even if it meant not gaining a partner visa';
const YES_MARRY = 'Yes, we would get married if it enabled us to gain a partner visa';
const NO_LIVE_TOGETHER = 'No, we would not move in with each other, even if it meant not gaining a partner visa';
const YES_LIVE_TOGETHER = 'Yes, we would begin living together if it enabled us to gain a partner visa';
const NEVER_MET = 'No, we have never met in-person';
const NON_COMMITTED_STATUSES = ['De facto', 'Dating', 'None of the above'];
const HIGH_RISK_SPONSOR_PR_PATHWAYS = [
    'Partner visa',
    'Prospective marriage visa',
    'Contributory parent visa',
    'Aged contributory parent visa',
    'Humanitarian visa',
];
const HIGH_RISK_COUNTRIES = ['Russian Federation', 'North Korea', 'Iran'];
const PROTECTED_APART_REASONS = [
    'Our religion required that we live apart',
    'In our culture it would have been unusual to live together so soon',
    'War and humanitarian reasons stopped us from living together',
];
const PMV_SPECIAL_CIRCUMSTANCES = [
    'The sponsor is now deceased',
    'The applicant experienced family violence by the sponsor',
    'There are children of the relationship with the sponsor',
];
const SPONSORSHIP_LIMITATION_DAYS = 1825;
const RECENT_RELATIONSHIP_DAYS = 182;
function daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
}
function daysAhead(days) {
    return daysAgo(-days);
}
function onOrAfter(dateStr, cutoff) {
    if (!dateStr)
        return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.getTime() >= cutoff.setHours(0, 0, 0, 0);
}
function onOrBefore(dateStr, cutoff) {
    if (!dateStr)
        return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.getTime() <= cutoff.setHours(23, 59, 59, 999);
}
function hasAny(values, targets) {
    return (values ?? []).some((v) => targets.includes(v));
}
let PartnerEligibilityEngine = class PartnerEligibilityEngine {
    assess(a) {
        const ineligible = this.isIneligible(a);
        const highRisk = this.isHighRisk(a);
        const becomingEligible = this.isBecomingEligible(a);
        const effort = this.effortLevel(a);
        let summary;
        if (ineligible) {
            summary = 'Ineligible';
        }
        else if (becomingEligible) {
            summary = highRisk
                ? 'Becoming Eligible - High Risk'
                : 'Becoming Eligible - Low Risk';
        }
        else {
            summary = highRisk ? 'Eligible - High Risk' : 'Eligible - Low Risk';
        }
        const outcome = summary === 'Ineligible'
            ? 'ineligible'
            : effort === 'High Effort'
                ? 'high_effort'
                : 'eligible';
        return { ineligible, highRisk, becomingEligible, effort, summary, outcome };
    }
    isIneligible(a) {
        const nonCommitted = NON_COMMITTED_STATUSES.includes(a.relationshipStatus);
        const sponsorshipCutoff = daysAgo(SPONSORSHIP_LIMITATION_DAYS);
        return (a.relationshipStatus === 'None of the above' ||
            a.bothOver18 === 'No' ||
            a.exclusiveRelationship === 'No' ||
            a.sponsorResidencyStatus === 'Visiting Australia temporarily' ||
            a.sponsorResidencyStatus === 'None of the above' ||
            a.previousSponsorshipEnded === 'No' ||
            onOrAfter(a.previousSponsorshipLodgedDate, sponsorshipCutoff) ||
            a.previousSponsorshipCount === '2 or more' ||
            a.stillWithPMVSponsor === 'Yes' ||
            a.marriedBeforePMVCeased === 'No' ||
            onOrAfter(a.sponsorPartnerVisaApplicationDate, daysAgo(SPONSORSHIP_LIMITATION_DAYS)) ||
            (nonCommitted &&
                a.liveTogetherNow === 'No' &&
                a.livedTogetherBefore === 'No' &&
                !hasAny(a.neverLivedTogetherReasons, PROTECTED_APART_REASONS) &&
                a.willingToMarry === NO_MARRY &&
                a.willingToLiveTogether === NO_LIVE_TOGETHER) ||
            (a.metInPerson === NEVER_MET &&
                nonCommitted &&
                (a.arrangedMarriage === 'No' || a.arrangedMarriage === 'Not sure')) ||
            ((a.pmvPreviousSponsorCircumstances?.length ?? 0) > 0 &&
                a.pmvPreviousSponsorCircumstances.every((c) => c === 'None of the above apply')));
    }
    isHighRisk(a) {
        const nonCommitted = NON_COMMITTED_STATUSES.includes(a.relationshipStatus);
        return (a.seriousHealthConditions === 'Yes' ||
            a.sponsorPreviouslySponsored === 'Yes' ||
            a.criminalOffences === 'Yes' ||
            a.visaIssues === 'Yes' ||
            HIGH_RISK_COUNTRIES.includes(a.applicantCountry) ||
            hasAny(a.pmvPreviousSponsorCircumstances, PMV_SPECIAL_CIRCUMSTANCES) ||
            a.marriedBeforePMVCeased === 'Yes' ||
            a.substantiveVisa === 'No' ||
            (!!a.sponsorPrPathway &&
                HIGH_RISK_SPONSOR_PR_PATHWAYS.includes(a.sponsorPrPathway)) ||
            (nonCommitted &&
                a.liveTogetherNow === 'No' &&
                a.livedTogetherBefore === 'No' &&
                a.willingToMarry === NO_MARRY &&
                (hasAny(a.neverLivedTogetherReasons, PROTECTED_APART_REASONS) ||
                    a.willingToLiveTogether === YES_LIVE_TOGETHER)));
    }
    isBecomingEligible(a) {
        const nonCommitted = NON_COMMITTED_STATUSES.includes(a.relationshipStatus);
        const recentCutoff = daysAgo(RECENT_RELATIONSHIP_DAYS);
        const committedOrWilling = a.relationshipStatus === 'Married' ||
            a.relationshipStatus === 'Engaged' ||
            a.willingToMarry === YES_MARRY;
        return (onOrAfter(a.datingStartDate, recentCutoff) ||
            (nonCommitted &&
                (a.liveTogetherNow === 'Yes' || a.livedTogetherBefore === 'Yes') &&
                onOrAfter(a.livingTogetherSince, daysAgo(RECENT_RELATIONSHIP_DAYS))) ||
            (committedOrWilling && a.liveTogetherNow === 'No') ||
            (a.metInPerson === NEVER_MET &&
                (a.relationshipStatus === 'Married' || a.relationshipStatus === 'Engaged')) ||
            (nonCommitted && a.metInPerson === NEVER_MET && a.arrangedMarriage === 'Yes'));
    }
    effortLevel(a) {
        const high = a.techComfort === 'Not comfortable' ||
            a.interpreterNeed === 'Yes, one of us has poor English' ||
            a.visaExpired === 'Yes' ||
            a.planningNewVisaSoon === 'No' ||
            onOrBefore(a.visaExpiryDate, daysAhead(5));
        if (high)
            return 'High Effort';
        const medium = a.techComfort === 'Somewhat comfortable' ||
            a.additionalMigratingMembers === '1' ||
            a.additionalMigratingMembers === '2 or more' ||
            a.interpreterNeed === "Maybe, we're not sure if our English is good enough" ||
            a.interpreterNeed === 'No, both of our English is good enough' ||
            a.planningNewVisaSoon === 'Yes' ||
            onOrBefore(a.visaExpiryDate, daysAhead(60));
        if (medium)
            return 'Medium Effort';
        return 'Low Effort';
    }
};
exports.PartnerEligibilityEngine = PartnerEligibilityEngine;
exports.PartnerEligibilityEngine = PartnerEligibilityEngine = __decorate([
    (0, common_1.Injectable)()
], PartnerEligibilityEngine);
//# sourceMappingURL=partner-eligibility.engine.js.map