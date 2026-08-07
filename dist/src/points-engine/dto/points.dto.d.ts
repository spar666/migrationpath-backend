export declare enum VisaGroup {
    GSM = "GSM",
    Business = "Business",
    Criteria_Only = "Criteria_Only",
    Relationship = "Relationship",
    Sponsorship = "Sponsorship"
}
export declare enum EnglishLevel {
    Competent = "competent",
    Proficient = "proficient",
    Superior = "superior"
}
export declare class PointsInputDto {
    visaGroup: string;
    subclass: string;
    age: number;
    englishLevel: string;
    educationLevel: string;
    workExperienceOverseas: number;
    workExperienceAustralia: number;
    skilledDate?: string;
    australianStudyRequirement?: boolean;
    isRegional?: boolean;
    professionalYear?: boolean;
    partnerSkills?: string;
    naati?: boolean;
    stemResearch?: boolean;
}
export declare class BusinessPointsInputDto {
    visaGroup: string;
    turnover: number;
    netAssets: number;
    hasPatent?: boolean;
    exportTrade?: boolean;
    highGrowth?: boolean;
}
export declare class PointsResultDto {
    totalPoints: number;
    breakdown: Record<string, number>;
    regionalBonus: boolean;
    prAdvantageBadge: boolean;
    ineligibilityReason?: string;
    belowPassMark?: boolean;
}
