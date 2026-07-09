import { CmsService } from './cms.service';
import { FaqQueryDto, GuideQueryDto, NewsArticleQueryDto, CmsPaginationDto } from './dto/cms-query.dto';
export declare class CmsController {
    private readonly cmsService;
    constructor(cmsService: CmsService);
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
    getBanners(query: CmsPaginationDto): Promise<import("./interfaces/strapi-content.interface").StrapiPaginatedResponse<import("./interfaces/strapi-content.interface").StrapiBanner>>;
    getBanner(id: number): Promise<import("./interfaces/strapi-content.interface").StrapiSingleResponse<import("./interfaces/strapi-content.interface").StrapiBanner>>;
    getFaqs(query: FaqQueryDto): Promise<import("./interfaces/strapi-content.interface").StrapiPaginatedResponse<import("./interfaces/strapi-content.interface").StrapiFaq>>;
    getFaq(id: number): Promise<import("./interfaces/strapi-content.interface").StrapiSingleResponse<import("./interfaces/strapi-content.interface").StrapiFaq>>;
    getGuides(query: GuideQueryDto): Promise<import("./interfaces/strapi-content.interface").StrapiPaginatedResponse<import("./interfaces/strapi-content.interface").StrapiGuide>>;
    getGuide(id: number): Promise<import("./interfaces/strapi-content.interface").StrapiSingleResponse<import("./interfaces/strapi-content.interface").StrapiGuide>>;
    getNewsArticles(query: NewsArticleQueryDto): Promise<import("./interfaces/strapi-content.interface").StrapiPaginatedResponse<import("./interfaces/strapi-content.interface").StrapiNewsArticle>>;
    getNewsArticleBySlug(slug: string): Promise<{
        data: import("./interfaces/strapi-content.interface").StrapiNewsArticle;
        meta: {
            pagination: {
                page: number;
                pageSize: number;
                pageCount: number;
                total: number;
            };
        };
    }>;
    getNewsArticle(id: number): Promise<import("./interfaces/strapi-content.interface").StrapiSingleResponse<import("./interfaces/strapi-content.interface").StrapiNewsArticle>>;
    getSuccessStories(query: CmsPaginationDto): Promise<import("./interfaces/strapi-content.interface").StrapiPaginatedResponse<import("./interfaces/strapi-content.interface").StrapiSuccessStory>>;
    getSuccessStory(id: number): Promise<import("./interfaces/strapi-content.interface").StrapiSingleResponse<import("./interfaces/strapi-content.interface").StrapiSuccessStory>>;
    getCategories(query: CmsPaginationDto): Promise<import("./interfaces/strapi-content.interface").StrapiPaginatedResponse<import("./interfaces/strapi-content.interface").StrapiCategory>>;
    getCategory(id: number): Promise<import("./interfaces/strapi-content.interface").StrapiSingleResponse<import("./interfaces/strapi-content.interface").StrapiCategory>>;
}
