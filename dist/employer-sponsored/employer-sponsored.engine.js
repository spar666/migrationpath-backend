"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmployerSponsoredEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerSponsoredEngine = exports.ENGINE_VERSION = void 0;
const common_1 = require("@nestjs/common");
const employer_sponsored_config_1 = require("./constants/employer-sponsored.config");
exports.ENGINE_VERSION = '0.1.0-placeholder-rules';
let EmployerSponsoredEngine = EmployerSponsoredEngine_1 = class EmployerSponsoredEngine {
    logger = new common_1.Logger(EmployerSponsoredEngine_1.name);
    occupationListCheck = null;
    setOccupationListCheck(check) {
        this.occupationListCheck = check;
    }
    async assess(input) {
        const applicant = input.applicant ?? {};
        const nomination = input.nomination ?? {};
        const sponsorFindings = input.sponsor
            ? this.assessSponsor(input.sponsor)
            : [];
        const candidates = nomination.subclass
            ? [nomination.subclass]
            : applicant.preferred_subclass
                ? [applicant.preferred_subclass, ...employer_sponsored_config_1.CONSIDERED_SUBCLASSES]
                : employer_sponsored_config_1.CONSIDERED_SUBCLASSES;
        const seen = new Set();
        const assessments = [];
        for (const subclass of candidates) {
            if (seen.has(subclass))
                continue;
            seen.add(subclass);
            const rule = employer_sponsored_config_1.SUBCLASS_RULES[subclass];
            if (!rule) {
                this.logger.warn(`Unknown subclass requested: ${subclass}`);
                continue;
            }
            assessments.push(await this.assessSubclass(subclass, rule, applicant, nomination));
        }
        const eligible = assessments.filter((a) => a.eligible);
        const best = eligible.find((a) => a.permanentResidence === 'direct') ??
            eligible[0] ??
            [...assessments].sort((a, b) => a.blockers.length - b.blockers.length ||
                a.undetermined.length - b.undetermined.length)[0];
        const statutoryEligible = eligible.length > 0;
        const sponsorBlocking = input.sponsor?.has_adverse_information === true ||
            input.sponsor?.meets_training_obligations === false;
        const fit = (0, employer_sponsored_config_1.computeClientFit)({
            party: input.party,
            age: applicant.age,
            annualSalary: nomination.annual_salary,
            subclass: best?.subclass,
            hasAbn: !!input.sponsor?.abn,
            statutoryEligible: statutoryEligible && !sponsorBlocking,
        });
        const reasons = [];
        const blockers = [];
        const openQuestions = [];
        if (statutoryEligible && !sponsorBlocking) {
            reasons.push(`On the information provided, ${best.label} looks like the strongest ` +
                `available pathway.`);
            reasons.push(...best.passes);
        }
        else if (best && best.blockers.length === 0 && best.undetermined.length) {
            reasons.push(`There isn't enough information yet to assess ${best.label}. ` +
                `Answering the outstanding questions will give you a result.`);
        }
        else if (best) {
            reasons.push(`On the information provided, ${best.label} is the closest pathway, ` +
                `but it is not currently met.`);
            blockers.push(...best.blockers);
        }
        else {
            blockers.push('No employer-sponsored pathway could be assessed from the information provided.');
        }
        if (sponsorBlocking) {
            blockers.push('A sponsor-side issue was declared that must be resolved before any ' +
                'nomination can proceed.');
        }
        if (best)
            openQuestions.push(...best.unknowns);
        if (applicant.has_health_or_character_concern === true) {
            openQuestions.push('A health or character matter was declared — this needs to be worked ' +
                'through before lodgement.');
        }
        if (applicant.has_health_or_character_concern == null) {
            openQuestions.push('Health and character position not yet declared.');
        }
        reasons.push(...fit.reasons);
        return {
            statutory_eligible: statutoryEligible && !sponsorBlocking,
            client_fit: fit.fit,
            recommended_subclass: best?.eligible ? best.subclass : undefined,
            recommended_label: best?.eligible ? best.label : undefined,
            reasons: dedupe(reasons),
            blockers: dedupe([...blockers, ...sponsorFindings.filter(isNegative)]),
            open_questions: dedupe(openQuestions),
            assessments,
            sponsor_findings: sponsorFindings,
            assessed_at: new Date().toISOString(),
            engine_version: exports.ENGINE_VERSION,
        };
    }
    async assessSubclass(subclass, rule, applicant, nomination) {
        const blockers = [];
        const unknowns = [];
        const passes = [];
        const undetermined = [];
        const cannotDetermine = (reason) => {
            unknowns.push(reason);
            undetermined.push(reason);
        };
        if (rule.maxAge !== null) {
            if (applicant.age == null) {
                cannotDetermine('Age was not provided.');
            }
            else if (applicant.age > rule.maxAge) {
                blockers.push(`${rule.label} has an age limit of ${rule.maxAge}; the applicant is ${applicant.age}.`);
            }
            else {
                passes.push(`Within the age limit for ${rule.label}.`);
            }
        }
        if (applicant.years_experience == null) {
            cannotDetermine('Years of relevant work experience were not provided.');
        }
        else if (applicant.years_experience < rule.minYearsExperience) {
            blockers.push(`${rule.label} requires at least ${rule.minYearsExperience} year(s) of ` +
                `relevant experience; ${applicant.years_experience} was given.`);
        }
        else {
            passes.push('Meets the minimum work experience requirement.');
        }
        if (applicant.english_overall == null &&
            applicant.english_lowest_band == null) {
            cannotDetermine('English test results were not provided.');
        }
        else {
            if (applicant.english_overall != null &&
                applicant.english_overall < rule.minEnglishOverall) {
                blockers.push(`${rule.label} requires an overall English score of at least ` +
                    `${rule.minEnglishOverall} (IELTS-equivalent).`);
            }
            if (applicant.english_lowest_band != null &&
                applicant.english_lowest_band < rule.minEnglishPerBand) {
                blockers.push(`${rule.label} requires at least ${rule.minEnglishPerBand} in every ` +
                    `component (IELTS-equivalent).`);
            }
            if ((applicant.english_overall ?? Infinity) >= rule.minEnglishOverall &&
                (applicant.english_lowest_band ?? Infinity) >= rule.minEnglishPerBand) {
                passes.push('Meets the English requirement.');
            }
        }
        const listed = await this.checkOccupationListed(applicant.occupation_code ?? nomination.occupation_code, rule.occupationLists, applicant.occupation_listed);
        if (listed == null) {
            cannotDetermine('Whether the nominated occupation appears on the relevant skilled ' +
                'occupation list has not been confirmed.');
        }
        else if (listed === false) {
            blockers.push(`The nominated occupation does not appear on the list(s) required for ` +
                `${rule.label}.`);
        }
        else {
            passes.push('The nominated occupation appears on the required list.');
        }
        if (nomination.annual_salary == null) {
            cannotDetermine('The nominated annual salary was not provided.');
        }
        else if (nomination.annual_salary < rule.minSalary) {
            blockers.push(`The nominated salary of $${fmt(nomination.annual_salary)} is below the ` +
                `$${fmt(rule.minSalary)} income threshold for ${rule.label}.`);
        }
        else {
            passes.push('The nominated salary clears the income threshold.');
            if (nomination.annual_salary < rule.minSalary / employer_sponsored_config_1.MARKET_RATE_WARNING_MARGIN) {
                unknowns.push('The salary clears the statutory floor but sits close to it — the ' +
                    'market salary rate test will need evidence.');
            }
        }
        if (rule.requiresRegional) {
            if (nomination.is_regional == null) {
                cannotDetermine('Whether the work location is regional was not confirmed.');
            }
            else if (!nomination.is_regional) {
                blockers.push(`${rule.label} requires the position to be in a designated regional area.`);
            }
            else {
                passes.push('The position is in a designated regional area.');
            }
        }
        if (rule.requiresLmt) {
            if (nomination.lmt_completed == null) {
                unknowns.push('Labour Market Testing status was not confirmed.');
            }
            else if (!nomination.lmt_completed) {
                unknowns.push('Labour Market Testing has not been completed yet; it must be done ' +
                    'before the nomination is lodged.');
            }
            else {
                passes.push('Labour Market Testing has been completed.');
            }
        }
        if (applicant.has_skills_assessment === false) {
            unknowns.push('No skills assessment yet — whether one is required depends on the ' +
                'occupation and the applicant’s passport.');
        }
        return {
            subclass,
            label: rule.label,
            eligible: blockers.length === 0 && undetermined.length === 0,
            unknowns: dedupe(unknowns),
            undetermined: dedupe(undetermined),
            blockers: dedupe(blockers),
            passes: dedupe(passes),
            permanentResidence: rule.permanentResidence,
        };
    }
    async checkOccupationListed(occupationCode, requiredLists, declared) {
        if (this.occupationListCheck) {
            try {
                return await this.occupationListCheck(occupationCode, requiredLists);
            }
            catch (error) {
                this.logger.error(`Occupation list lookup failed: ${error.message}`);
                return null;
            }
        }
        return declared ?? null;
    }
    assessSponsor(sponsor) {
        const findings = [];
        if (!sponsor.abn) {
            findings.push('No ABN was provided for the sponsoring business.');
        }
        if (sponsor.years_trading == null) {
            findings.push('How long the business has been trading was not provided.');
        }
        else if (sponsor.years_trading < employer_sponsored_config_1.SPONSOR_RULES.minYearsTradingForStandard) {
            findings.push(`The business has been trading for under ` +
                `${employer_sponsored_config_1.SPONSOR_RULES.minYearsTradingForStandard} year(s), which limits the ` +
                `sponsorship options available to it.`);
        }
        if (sponsor.employee_count != null &&
            sponsor.employee_count < employer_sponsored_config_1.SPONSOR_RULES.smallBusinessHeadcount) {
            findings.push('Small headcount — expect closer scrutiny of whether the nominated ' +
                'position is genuine and full-time.');
        }
        if (sponsor.has_adverse_information === true) {
            findings.push('Adverse information was declared against the business or an ' +
                'associate. This must be addressed before any nomination.');
        }
        if (sponsor.meets_training_obligations === false) {
            findings.push('The business declared it does not currently meet its training / ' +
                'Skilling Australians Fund obligations.');
        }
        if (sponsor.sponsorship_status === 'refused') {
            findings.push('A previous sponsorship application was refused — the history needs ' +
                'to be reviewed before reapplying.');
        }
        if (sponsor.sponsorship_status === 'approved') {
            findings.push('The business already holds an approved sponsorship.');
        }
        return findings;
    }
};
exports.EmployerSponsoredEngine = EmployerSponsoredEngine;
exports.EmployerSponsoredEngine = EmployerSponsoredEngine = EmployerSponsoredEngine_1 = __decorate([
    (0, common_1.Injectable)()
], EmployerSponsoredEngine);
function dedupe(values) {
    return [...new Set(values.filter(Boolean))];
}
function fmt(value) {
    return value.toLocaleString('en-AU', { maximumFractionDigits: 0 });
}
function isNegative(finding) {
    return (finding.includes('Adverse information') ||
        finding.includes('does not currently meet') ||
        finding.includes('was refused'));
}
//# sourceMappingURL=employer-sponsored.engine.js.map