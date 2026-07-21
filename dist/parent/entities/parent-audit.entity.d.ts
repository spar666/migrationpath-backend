export declare class ParentAudit {
    id: string;
    sponsorStatus: string;
    sponsorMonthsInAustralia: number;
    totalChildren: number;
    childrenInAustralia: number;
    childrenInLargestOtherCountry: number;
    sponsorTaxableIncome: number;
    parentAge: number;
    isEligible: boolean;
    status: string;
    balancePercentage: number;
    balancePass: boolean;
    sponsorCheckPass: boolean;
    aosMeetsBenchmark: boolean;
    requiresCoAssurer: boolean;
    predictedSubclass: string;
    recommendations: string[] | null;
    created_at: Date;
}
