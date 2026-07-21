import { EnglishProficiency, QualificationLevel } from '../constants/points-catalogue';
export declare class UserProfileDto {
    visaGroup?: string;
    age: number;
    englishLevel: EnglishProficiency;
    qualification: QualificationLevel;
    overseasWorkYears: number;
    australianWorkYears: number;
    regionalStudy?: boolean;
}
export declare class StructuredPointsResultDto {
    totalPoints: number;
    breakdown: Record<string, number>;
    workCapApplied: boolean;
    belowPassMark: boolean;
    ineligibilityReason?: string;
}
