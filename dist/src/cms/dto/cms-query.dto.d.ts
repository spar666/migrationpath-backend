export declare class CmsPaginationDto {
    page?: number;
    pageSize?: number;
}
export declare class FaqQueryDto extends CmsPaginationDto {
    category?: string;
    persona?: string;
}
export declare class GuideQueryDto extends CmsPaginationDto {
    category?: string;
    persona?: string;
    difficulty?: string;
}
export declare class NewsArticleQueryDto extends CmsPaginationDto {
    category?: string;
    target_persona?: string;
}
