export declare enum PointsCategory {
    AGE = "AGE",
    ENGLISH = "ENGLISH",
    OVERSEAS_WORK = "OVERSEAS_WORK",
    AUSTRALIAN_WORK = "AUSTRALIAN_WORK",
    QUALIFICATIONS = "QUALIFICATIONS",
    REGIONAL_STUDY = "REGIONAL_STUDY"
}
export declare enum EnglishProficiency {
    COMPETENT = "competent",
    PROFICIENT = "proficient",
    SUPERIOR = "superior"
}
export declare enum QualificationLevel {
    DOCTORATE = "doctorate",
    BACHELOR_MASTERS = "bachelor_masters",
    DIPLOMA_TRADE = "diploma_trade",
    OTHER_RECOGNISED = "other_recognised"
}
export declare const COMBINED_WORK_POINTS_CAP = 20;
export declare const REGIONAL_STUDY_POINTS = 5;
export declare const GSM_PASS_MARK = 65;
export declare const GSM_MAX_AGE = 45;
export declare const DEFAULT_VISA_GROUP = "GSM";
export interface PointsRuleSeed {
    visaGroup: string;
    category: PointsCategory;
    attributeLabel: string | null;
    minValue: number | null;
    maxValue: number | null;
    points: number;
}
export declare const STRUCTURED_POINTS_RULES: PointsRuleSeed[];
export declare const STRUCTURED_CATEGORY_KEYS: PointsCategory[];
