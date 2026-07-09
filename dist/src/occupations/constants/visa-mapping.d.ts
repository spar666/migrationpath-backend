export declare enum SkilledList {
    MLTSSL = "MLTSSL",
    STSOL = "STSOL",
    ROL = "ROL",
    CSOL = "CSOL"
}
export declare enum VisaResidencyType {
    PERMANENT = "permanent",
    PROVISIONAL = "provisional",
    TEMPORARY = "temporary"
}
export interface VisaSeed {
    subclassNumber: string;
    streamTitle: string;
    residencyType: VisaResidencyType;
    name: string;
}
export declare const VISA_CATALOGUE: VisaSeed[];
export declare const SKILLED_LIST_VISA_MATRIX: Record<SkilledList, string[]>;
export declare function resolveEligibleSubclasses(primaryList: SkilledList | null | undefined): string[];
