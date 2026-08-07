import { PartnerEligibilityDto } from './dto/partner-eligibility.dto';
export type EligibilitySummary = 'Ineligible' | 'Becoming Eligible - High Risk' | 'Becoming Eligible - Low Risk' | 'Eligible - High Risk' | 'Eligible - Low Risk';
export type EffortLevel = 'Low Effort' | 'Medium Effort' | 'High Effort';
export type EligibilityOutcome = 'eligible' | 'high_effort' | 'ineligible';
export interface EligibilityResult {
    ineligible: boolean;
    highRisk: boolean;
    becomingEligible: boolean;
    effort: EffortLevel;
    summary: EligibilitySummary;
    outcome: EligibilityOutcome;
}
export declare class PartnerEligibilityEngine {
    assess(a: PartnerEligibilityDto): EligibilityResult;
    private isIneligible;
    private isHighRisk;
    private isBecomingEligible;
    private effortLevel;
}
