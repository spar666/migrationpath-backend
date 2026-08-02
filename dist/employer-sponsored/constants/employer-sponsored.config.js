"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENT_FIT = exports.SPONSOR_RULES = exports.OCCUPATION_LIST_NAMES = exports.CONSIDERED_SUBCLASSES = exports.SUBCLASS_RULES = exports.MARKET_RATE_WARNING_MARGIN = exports.SPECIALIST_SKILLS_INCOME_THRESHOLD = exports.CORE_SKILLS_INCOME_THRESHOLD = void 0;
exports.computeClientFit = computeClientFit;
exports.CORE_SKILLS_INCOME_THRESHOLD = 73_150;
exports.SPECIALIST_SKILLS_INCOME_THRESHOLD = 135_000;
exports.MARKET_RATE_WARNING_MARGIN = 0.9;
exports.SUBCLASS_RULES = {
    '482': {
        label: 'Skills in Demand (subclass 482)',
        maxAge: null,
        minYearsExperience: 1,
        minSalary: exports.CORE_SKILLS_INCOME_THRESHOLD,
        minEnglishOverall: 5.0,
        minEnglishPerBand: 5.0,
        requiresRegional: false,
        requiresLmt: true,
        occupationLists: ['CSOL'],
        permanentResidence: 'pathway',
    },
    '186': {
        label: 'Employer Nomination Scheme (subclass 186)',
        maxAge: 45,
        minYearsExperience: 3,
        minSalary: exports.CORE_SKILLS_INCOME_THRESHOLD,
        minEnglishOverall: 6.0,
        minEnglishPerBand: 6.0,
        requiresRegional: false,
        requiresLmt: true,
        occupationLists: ['CSOL'],
        permanentResidence: 'direct',
    },
    '494': {
        label: 'Skilled Employer Sponsored Regional (subclass 494)',
        maxAge: 45,
        minYearsExperience: 3,
        minSalary: exports.CORE_SKILLS_INCOME_THRESHOLD,
        minEnglishOverall: 5.0,
        minEnglishPerBand: 5.0,
        requiresRegional: true,
        requiresLmt: true,
        occupationLists: ['CSOL', 'ROL'],
        permanentResidence: 'pathway',
    },
};
exports.CONSIDERED_SUBCLASSES = ['186', '494', '482'];
exports.OCCUPATION_LIST_NAMES = {
    CSOL: 'Core Skills Occupation List',
    ROL: 'Regional Occupation List',
};
exports.SPONSOR_RULES = {
    minYearsTradingForStandard: 1,
    smallBusinessHeadcount: 5,
};
exports.CLIENT_FIT = {
    minSalaryOfInterest: 70_000,
    requireAbnForBusiness: true,
    servicedSubclasses: ['482', '186', '494'],
    hardAgeCeiling: 50,
};
function computeClientFit(input) {
    const reasons = [];
    let fit = true;
    if (input.subclass && !exports.CLIENT_FIT.servicedSubclasses.includes(input.subclass)) {
        fit = false;
        reasons.push(`We do not currently service subclass ${input.subclass} matters.`);
    }
    if (typeof input.annualSalary === 'number' &&
        input.annualSalary > 0 &&
        input.annualSalary < exports.CLIENT_FIT.minSalaryOfInterest) {
        fit = false;
        reasons.push('The nominated salary is below the level at which this pathway is ' +
            'usually commercially viable for the applicant.');
    }
    if (typeof input.age === 'number' && input.age > exports.CLIENT_FIT.hardAgeCeiling) {
        fit = false;
        reasons.push('Age places the main employer-sponsored permanent pathways out of reach.');
    }
    if (input.party === 'business' &&
        exports.CLIENT_FIT.requireAbnForBusiness &&
        !input.hasAbn) {
        fit = false;
        reasons.push('No ABN was provided, so the business is likely too early in its ' +
            'set-up for a sponsorship engagement.');
    }
    if (fit && !input.statutoryEligible) {
        reasons.push('Not currently eligible, but close enough that an alternative pathway ' +
            'is worth discussing.');
    }
    return { fit, reasons };
}
//# sourceMappingURL=employer-sponsored.config.js.map