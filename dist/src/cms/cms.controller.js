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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cms_service_1 = require("./cms.service");
const cms_query_dto_1 = require("./dto/cms-query.dto");
let CmsController = class CmsController {
    cmsService;
    constructor(cmsService) {
        this.cmsService = cmsService;
    }
    health() {
        return this.cmsService.health();
    }
    getBanners(query) {
        return this.cmsService.getBanners(query);
    }
    getBanner(id) {
        return this.cmsService.getBanner(id);
    }
    getFaqs(query) {
        const params = {};
        if (query.page)
            params['pagination[page]'] = query.page;
        if (query.pageSize)
            params['pagination[pageSize]'] = query.pageSize;
        if (query.category)
            params['filters[category][$eq]'] = query.category;
        if (query.persona)
            params['filters[persona][$eq]'] = query.persona;
        return this.cmsService.getFaqs(params);
    }
    getFaq(id) {
        return this.cmsService.getFaq(id);
    }
    getGuides(query) {
        const params = {};
        if (query.page)
            params['pagination[page]'] = query.page;
        if (query.pageSize)
            params['pagination[pageSize]'] = query.pageSize;
        if (query.category)
            params['filters[category][$eq]'] = query.category;
        if (query.persona)
            params['filters[persona][$eq]'] = query.persona;
        if (query.difficulty)
            params['filters[difficulty][$eq]'] = query.difficulty;
        return this.cmsService.getGuides(params);
    }
    getGuide(id) {
        return this.cmsService.getGuide(id);
    }
    getNewsArticles(query) {
        const params = {};
        if (query.page)
            params['pagination[page]'] = query.page;
        if (query.pageSize)
            params['pagination[pageSize]'] = query.pageSize;
        if (query.category)
            params['filters[category][$eq]'] = query.category;
        if (query.target_persona)
            params['filters[target_persona][$eq]'] = query.target_persona;
        return this.cmsService.getNewsArticles(params);
    }
    getNewsArticleBySlug(slug) {
        return this.cmsService.getNewsArticleBySlug(slug);
    }
    getNewsArticle(id) {
        return this.cmsService.getNewsArticle(id);
    }
    getSuccessStories(query) {
        return this.cmsService.getSuccessStories(query);
    }
    getSuccessStory(id) {
        return this.cmsService.getSuccessStory(id);
    }
    getCategories(query) {
        return this.cmsService.getCategories(query);
    }
    getCategory(id) {
        return this.cmsService.getCategory(id);
    }
};
exports.CmsController = CmsController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Check Strapi CMS connection status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('banners'),
    (0, swagger_1.ApiOperation)({ summary: 'List all banners from CMS' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cms_query_dto_1.CmsPaginationDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getBanners", null);
__decorate([
    (0, common_1.Get)('banners/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single banner by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getBanner", null);
__decorate([
    (0, common_1.Get)('faqs'),
    (0, swagger_1.ApiOperation)({ summary: 'List FAQs with optional category/persona filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cms_query_dto_1.FaqQueryDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getFaqs", null);
__decorate([
    (0, common_1.Get)('faqs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single FAQ by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getFaq", null);
__decorate([
    (0, common_1.Get)('guides'),
    (0, swagger_1.ApiOperation)({ summary: 'List guides with optional filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cms_query_dto_1.GuideQueryDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getGuides", null);
__decorate([
    (0, common_1.Get)('guides/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single guide by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getGuide", null);
__decorate([
    (0, common_1.Get)('news-articles'),
    (0, swagger_1.ApiOperation)({ summary: 'List news articles with optional filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cms_query_dto_1.NewsArticleQueryDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getNewsArticles", null);
__decorate([
    (0, common_1.Get)('news-articles/slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single news article by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getNewsArticleBySlug", null);
__decorate([
    (0, common_1.Get)('news-articles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single news article by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getNewsArticle", null);
__decorate([
    (0, common_1.Get)('success-stories'),
    (0, swagger_1.ApiOperation)({ summary: 'List success stories from CMS' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cms_query_dto_1.CmsPaginationDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getSuccessStories", null);
__decorate([
    (0, common_1.Get)('success-stories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single success story by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getSuccessStory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List all categories from CMS' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cms_query_dto_1.CmsPaginationDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single category by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getCategory", null);
exports.CmsController = CmsController = __decorate([
    (0, swagger_1.ApiTags)('cms'),
    (0, common_1.Controller)('cms'),
    __metadata("design:paramtypes", [cms_service_1.CmsService])
], CmsController);
//# sourceMappingURL=cms.controller.js.map