export declare class PathwayDto {
    university: string;
    course: string;
    anzsco_code?: string;
    occupation?: string;
    duration: string;
    degree_level: string;
}
export declare class SearchResponseDto {
    summary: string;
    pathways: PathwayDto[];
}
