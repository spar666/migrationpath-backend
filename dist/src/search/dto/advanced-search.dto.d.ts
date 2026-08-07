export declare class SelectedOccupationDto {
    occupation: string;
}
export declare class FiltersDto {
    isRegional?: boolean;
    agePoints?: number;
    englishPoints?: number;
    visaSubclasses?: string[];
}
export declare class AdvancedSearchDto {
    q?: string;
    selectedOccupation?: SelectedOccupationDto;
    filters?: FiltersDto;
    page?: number;
    limit?: number;
}
