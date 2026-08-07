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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const search_service_1 = require("./search.service");
const intent_service_1 = require("./intent.service");
const search_query_dto_1 = require("./dto/search-query.dto");
const advanced_search_dto_1 = require("./dto/advanced-search.dto");
const intent_query_dto_1 = require("./dto/intent-query.dto");
let SearchController = class SearchController {
    searchService;
    intentService;
    constructor(searchService, intentService) {
        this.searchService = searchService;
        this.intentService = intentService;
    }
    async searchCoursesAndOccupations(data) {
        return this.searchService.searchCoursesAndOccupations(data);
    }
    async resolveIntent(queryDto) {
        return this.intentService.classify(queryDto.q);
    }
    async search(queryDto) {
        return this.searchService.search(queryDto);
    }
    async advancedSearch(body) {
        const { page = 1, limit = 10, debug = false } = body || {};
        return this.searchService.searchAdvanced(body, page, limit, debug);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(''),
    (0, swagger_1.ApiOperation)({ summary: 'Search courses and occupations' }),
    (0, swagger_1.ApiQuery)({
        name: 'data',
        required: false,
        description: 'Search term (course or occupation) or "all"',
    }),
    __param(0, (0, common_1.Query)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchCoursesAndOccupations", null);
__decorate([
    (0, common_1.Get)('intent'),
    (0, swagger_1.ApiOperation)({
        summary: 'Smart query router: classify a raw query as SKILLED / STUDENT / FAMILY and return the matching funnel payload',
    }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, description: 'Raw user query' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Intent classification with a stream-specific payload (split-screen visas for SKILLED, course list for STUDENT, redirect for FAMILY).',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [intent_query_dto_1.IntentQueryDto]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "resolveIntent", null);
__decorate([
    (0, common_1.Get)('occupations'),
    (0, swagger_1.ApiOperation)({ summary: 'Search for universities and courses' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_query_dto_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Post)('advanced'),
    (0, swagger_1.ApiOperation)({ summary: 'Advanced search with payload and filters' }),
    (0, swagger_1.ApiBody)({ type: advanced_search_dto_1.AdvancedSearchDto }),
    (0, swagger_1.ApiConsumes)('application/json'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Advanced search results' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "advancedSearch", null);
exports.SearchController = SearchController = __decorate([
    (0, swagger_1.ApiTags)('search'),
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [search_service_1.SearchService,
        intent_service_1.IntentService])
], SearchController);
//# sourceMappingURL=search.controller.js.map