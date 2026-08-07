export declare class PartnerAudit {
    id: string;
    currentLocation: string;
    jointBankAccounts: boolean;
    jointLeaseOrMortgage: boolean;
    sharedUtilityBills: boolean;
    sharedDomesticBills: boolean;
    jointChildResponsibility: boolean;
    matchingAddressHistory: boolean;
    sharedTravelItineraries: boolean;
    form888Count: number;
    jointSocialInvitations: boolean;
    livedTogether12Months: boolean;
    registeredRelationshipBDM: boolean;
    overallReadiness: number;
    financialScore: number;
    householdScore: number;
    socialScore: number;
    commitmentScore: number;
    commitmentStatus: string;
    legislativeWaiverApplied: boolean;
    predictedSubclass: string;
    recommendations: string[] | null;
    created_at: Date;
}
