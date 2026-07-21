export type PillarKey = 'financial' | 'household' | 'social' | 'commitment';
export type CommitmentStatus = 'LEGALLY UNLOCKED' | 'STANDARD';
export interface PillarResult {
    key: PillarKey;
    label: string;
    score: number;
    percentage: number;
    status: CommitmentStatus;
}
export interface PredictedVisa {
    subclass: '820' | '309';
    name: string;
    location: 'onshore' | 'offshore';
}
export declare class PartnerAuditResultDto {
    auditId: string;
    overallReadiness: number;
    pillars: PillarResult[];
    predictedVisa: PredictedVisa;
    legislativeWaiverApplied: boolean;
    commitmentStatus: CommitmentStatus;
    recommendations: string[];
}
