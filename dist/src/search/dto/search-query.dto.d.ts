export declare enum SearchType {
    COURSE = "course",
    OCCUPATION = "occupation",
    ALL = "all"
}
export declare class SearchQueryDto {
    q?: string;
    type?: SearchType;
    occupation?: string;
    course?: string;
    page?: number;
    limit?: number;
    location_type?: string;
    age_points?: string;
    english_score?: string;
    visa_subclass?: string;
}
