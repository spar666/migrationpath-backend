"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const strapi_constants_1 = require("../common/constants/strapi.constants");
let CmsService = CmsService_1 = class CmsService {
    configService;
    logger = new common_1.Logger(CmsService_1.name);
    baseUrl;
    apiToken;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl =
            this.configService.get('strapi.url') || 'http://localhost:1337';
        this.apiToken = this.configService.get('strapi.apiToken') || '';
    }
    get headers() {
        return this.apiToken ? { Authorization: `Bearer ${this.apiToken}` } : {};
    }
    async fetchList(endpoint, params) {
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/api/${endpoint}`, { headers: this.headers, params });
            return data;
        }
        catch (error) {
            this.handleError(error, endpoint);
        }
    }
    async fetchOne(endpoint, params) {
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/api/${endpoint}`, { headers: this.headers, params });
            return data;
        }
        catch (error) {
            this.handleError(error, endpoint);
        }
    }
    handleError(error, entity) {
        const status = error.response?.status;
        const entityName = entity.replace(/^\//, '');
        if (status === 403) {
            throw new common_1.HttpException(strapi_constants_1.STRAPI_MESSAGES.FORBIDDEN(entityName), common_1.HttpStatus.FORBIDDEN);
        }
        if (status === 401) {
            throw new common_1.HttpException(strapi_constants_1.STRAPI_MESSAGES.UNAUTHORIZED(), common_1.HttpStatus.UNAUTHORIZED);
        }
        if (status === 404) {
            throw new common_1.HttpException(strapi_constants_1.STRAPI_MESSAGES.NOT_FOUND(entityName), common_1.HttpStatus.NOT_FOUND);
        }
        if (status && status >= 500) {
            throw new common_1.HttpException(strapi_constants_1.STRAPI_MESSAGES.SERVER_ERROR(entityName), common_1.HttpStatus.BAD_GATEWAY);
        }
        this.logger.error(strapi_constants_1.STRAPI_MESSAGES.FETCH_ERROR(entityName, error.message));
        throw new common_1.HttpException(strapi_constants_1.STRAPI_MESSAGES.FETCH_ERROR(entityName, error.message), common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
    async getBanners(params) {
        const result = await this.fetchList('banners', params);
        return result;
    }
    async getBanner(id) {
        return this.fetchOne(`banners/${id}`);
    }
    async getFaqs(params) {
        return this.fetchList('faqs', params);
    }
    async getFaq(id) {
        return this.fetchOne(`faqs/${id}`);
    }
    async getGuides(params) {
        return this.fetchList('guides', params);
    }
    async getGuide(id) {
        return this.fetchOne(`guides/${id}`);
    }
    async getNewsArticles(params) {
        return this.fetchList('news-articles', params);
    }
    async getNewsArticle(id) {
        return this.fetchOne(`news-articles/${id}`);
    }
    async getNewsArticleBySlug(slug) {
        const result = await this.fetchList('news-articles', {
            'filters[slug][$eq]': slug,
        });
        if (!result.data || result.data.length === 0) {
            throw new common_1.HttpException(`News article with slug "${slug}" not found`, common_1.HttpStatus.NOT_FOUND);
        }
        return { data: result.data[0], meta: result.meta };
    }
    async getSuccessStories(params) {
        return this.fetchList('success-stories', params);
    }
    async getSuccessStory(id) {
        return this.fetchOne(`success-stories/${id}`);
    }
    async getCategories(params) {
        return this.fetchList('categories', params);
    }
    async getCategory(id) {
        return this.fetchOne(`categories/${id}`);
    }
    async health() {
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/api/banners`, {
                headers: this.headers,
                params: { 'pagination[pageSize]': 1 },
            });
            return {
                connected: true,
                message: 'Successfully connected to Strapi CMS',
                contentTypes: {
                    banners: data.meta?.pagination?.total ?? 0,
                },
            };
        }
        catch (error) {
            return {
                connected: false,
                message: `Failed to connect to Strapi CMS: ${error.message}`,
            };
        }
    }
};
exports.CmsService = CmsService;
exports.CmsService = CmsService = CmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CmsService);
//# sourceMappingURL=cms.service.js.map