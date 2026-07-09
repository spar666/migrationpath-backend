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
exports.VisaRecommendationController = void 0;
const common_1 = require("@nestjs/common");
const visa_recommendation_service_1 = require("./visa-recommendation.service");
const visa_recommendation_dto_1 = require("./dto/visa-recommendation.dto");
const swagger_1 = require("@nestjs/swagger");
let VisaRecommendationController = class VisaRecommendationController {
    visaRecommendationService;
    constructor(visaRecommendationService) {
        this.visaRecommendationService = visaRecommendationService;
    }
    recommend(dto) {
        return this.visaRecommendationService.recommend(dto.anzscoCode, dto.points);
    }
    findAllSubclasses() {
        return [
            { id: '189', name: 'Skilled Independent' },
            { id: '190', name: 'Skilled Nominated' },
            { id: '491', name: 'Skilled Work Regional' },
        ];
    }
};
exports.VisaRecommendationController = VisaRecommendationController;
__decorate([
    (0, common_1.Post)('recommend'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get visa recommendations based on points and occupation (public)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [visa_recommendation_dto_1.VisaRecommendationDto]),
    __metadata("design:returntype", void 0)
], VisaRecommendationController.prototype, "recommend", null);
__decorate([
    (0, common_1.Get)('subclasses'),
    (0, swagger_1.ApiOperation)({ summary: 'List all visa subclasses with metadata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VisaRecommendationController.prototype, "findAllSubclasses", null);
exports.VisaRecommendationController = VisaRecommendationController = __decorate([
    (0, swagger_1.ApiTags)('visa-recommendation'),
    (0, common_1.Controller)('visa'),
    __metadata("design:paramtypes", [visa_recommendation_service_1.VisaRecommendationService])
], VisaRecommendationController);
//# sourceMappingURL=visa-recommendation.controller.js.map