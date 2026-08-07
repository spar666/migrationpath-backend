export declare const REGIONAL_CATEGORIES: readonly ["METRO", "CATEGORY_2", "CATEGORY_3"];
export declare class CreateRegionalBandDto {
    region: string;
    category: string;
    postcodeFrom: number;
    postcodeTo: number;
    isActive?: boolean;
    effectiveDate?: string;
    sourceNote?: string;
}
declare const UpdateRegionalBandDto_base: import("@nestjs/common").Type<Partial<CreateRegionalBandDto>>;
export declare class UpdateRegionalBandDto extends UpdateRegionalBandDto_base {
}
export declare class BulkImportRegionalBandsDto {
    replaceAll?: boolean;
    rows: CreateRegionalBandDto[];
}
export {};
