export declare class PartnerEligibilitySubmission {
    id: string;
    applicantFirstName: string;
    sponsorFirstName: string;
    completedBy: string;
    email: string;
    applicantCountry: string;
    relationshipStatus: string;
    outcome: string;
    summary: string;
    effort: string;
    highRisk: boolean;
    becomingEligible: boolean;
    answers: Record<string, unknown>;
    created_at: Date;
}
