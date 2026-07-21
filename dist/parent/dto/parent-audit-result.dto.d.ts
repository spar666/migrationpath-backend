export type ParentStatus = 'LEGALLY_ELIGIBLE' | 'LEGALLY_INELIGIBLE';
export interface SponsorCheckResult {
    pass: boolean;
    reason?: string;
}
export interface BalanceOfFamilyResult {
    childrenInAustralia: number;
    totalChildren: number;
    percentage: number;
    pass: boolean;
    alternativeLimbPass: boolean;
    reason?: string;
}
export interface AosResult {
    sponsorTaxableIncome: number;
    benchmark: number;
    meetsBenchmark: boolean;
    requiresCoAssurer: boolean;
    warning?: string;
}
export interface ParentPredictedVisa {
    subclass: string;
    name: string;
    track: 'aged_parent' | 'contributory_parent';
}
export declare class ParentAuditResultDto {
    auditId: string;
    isEligible: boolean;
    status: ParentStatus;
    balanceOfFamily: BalanceOfFamilyResult;
    sponsorCheck: SponsorCheckResult;
    aos: AosResult;
    predictedVisa: ParentPredictedVisa;
    recommendations: string[];
}
