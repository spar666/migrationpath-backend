import { ConfigService } from '@nestjs/config';
import { StrapiBanner, StrapiCategory, StrapiFaq, StrapiGuide, StrapiNewsArticle, StrapiSuccessStory, StrapiPaginatedResponse, StrapiSingleResponse } from './interfaces/strapi-content.interface';
export declare class CmsService {
    private configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiToken;
    constructor(configService: ConfigService);
    private get headers();
    private fetchList;
    private fetchOne;
    private handleError;
    getBanners(params?: Record<string, any>): Promise<StrapiPaginatedResponse<StrapiBanner>>;
    getBanner(id: number): Promise<StrapiSingleResponse<StrapiBanner>>;
    getFaqs(params?: Record<string, any>): Promise<StrapiPaginatedResponse<StrapiFaq>>;
    getFaq(id: number): Promise<StrapiSingleResponse<StrapiFaq>>;
    getGuides(params?: Record<string, any>): Promise<StrapiPaginatedResponse<StrapiGuide>>;
    getGuide(id: number): Promise<StrapiSingleResponse<StrapiGuide>>;
    getNewsArticles(params?: Record<string, any>): Promise<StrapiPaginatedResponse<StrapiNewsArticle>>;
    getNewsArticle(id: number): Promise<StrapiSingleResponse<StrapiNewsArticle>>;
    getNewsArticleBySlug(slug: string): Promise<{
        data: StrapiNewsArticle;
        meta: {
            pagination: {
                page: number;
                pageSize: number;
                pageCount: number;
                total: number;
            };
        };
    }>;
    getSuccessStories(params?: Record<string, any>): Promise<StrapiPaginatedResponse<StrapiSuccessStory>>;
    getSuccessStory(id: number): Promise<StrapiSingleResponse<StrapiSuccessStory>>;
    getCategories(params?: Record<string, any>): Promise<StrapiPaginatedResponse<StrapiCategory>>;
    getCategory(id: number): Promise<StrapiSingleResponse<StrapiCategory>>;
    health(): Promise<{
        connected: boolean;
        message: string;
        contentTypes: {
            banners: any;
        };
    } | {
        connected: boolean;
        message: string;
        contentTypes?: undefined;
    }>;
}
