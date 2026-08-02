export declare const CORE_SKILLS_INCOME_THRESHOLD = 73150;
export declare const SPECIALIST_SKILLS_INCOME_THRESHOLD = 135000;
export declare const MARKET_RATE_WARNING_MARGIN = 0.9;
export interface SubclassRule {
    label: string;
    maxAge: number | null;
    minYearsExperience: number;
    minSalary: number;
    minEnglishOverall: number;
    minEnglishPerBand: number;
    requiresRegional: boolean;
    requiresLmt: boolean;
    occupationLists: string[];
    permanentResidence: 'direct' | 'pathway' | 'none';
}
export declare const SUBCLASS_RULES: Record<string, SubclassRule>;
export declare const CONSIDERED_SUBCLASSES: string[];
export declare const OCCUPATION_LIST_NAMES: {
    readonly CSOL: "Core Skills Occupation List";
    readonly ROL: "Regional Occupation List";
};
export type OccupationListCheck = (occupationCode: string | undefined, requiredLists: string[]) => Promise<boolean | null> | boolean | null;
export declare const SPONSOR_RULES: {
    minYearsTradingForStandard: number;
    smallBusinessHeadcount: number;
};
export declare const CLIENT_FIT: {
    minSalaryOfInterest: number;
    requireAbnForBusiness: boolean;
    servicedSubclasses: string[];
    hardAgeCeiling: number;
};
export interface ClientFitInput {
    party: 'applicant' | 'business';
    age?: number;
    annualSalary?: number;
    subclass?: string;
    hasAbn?: boolean;
    statutoryEligible: boolean;
}
export interface ClientFitResult {
    fit: boolean;
    reasons: string[];
}
export declare function computeClientFit(input: ClientFitInput): ClientFitResult;
