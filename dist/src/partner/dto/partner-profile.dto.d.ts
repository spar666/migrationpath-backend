export declare enum ApplicantLocation {
    ONSHORE = "onshore",
    OFFSHORE = "offshore"
}
export declare class PartnerProfileDto {
    currentLocation: ApplicantLocation;
    jointBankAccounts?: boolean;
    jointLeaseOrMortgage?: boolean;
    sharedUtilityBills?: boolean;
    sharedDomesticBills?: boolean;
    jointChildResponsibility?: boolean;
    matchingAddressHistory?: boolean;
    sharedTravelItineraries?: boolean;
    form888Count?: number;
    jointSocialInvitations?: boolean;
    livedTogether12Months?: boolean;
    registeredRelationshipBDM?: boolean;
}
