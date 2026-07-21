export declare enum SponsorStatus {
    CITIZEN = "citizen",
    PERMANENT_RESIDENT = "permanent_resident",
    ELIGIBLE_NZ = "eligible_nz",
    NONE = "none"
}
export declare class ParentProfileDto {
    sponsorStatus: SponsorStatus;
    sponsorMonthsInAustralia: number;
    totalChildren: number;
    childrenInAustralia: number;
    childrenInLargestOtherCountry?: number;
    sponsorTaxableIncome: number;
    parentAge: number;
}
