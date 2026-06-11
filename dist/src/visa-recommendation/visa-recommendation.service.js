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
exports.VisaRecommendationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const occupation_entity_1 = require("../occupations/entities/occupation.entity");
let VisaRecommendationService = class VisaRecommendationService {
    occupationRepository;
    constructor(occupationRepository) {
        this.occupationRepository = occupationRepository;
    }
    async recommend(anzscoCode, points) {
        const occupation = await this.occupationRepository.findOne({
            where: { anzsco_code: anzscoCode },
            relations: ['thresholds'],
        });
        if (!occupation)
            return [];
        const recommendations = [];
        recommendations.push({
            subclass: '189',
            name: 'Skilled Independent',
            eligible: points.totalPoints >= 65,
            reason: points.totalPoints < 65 ? 'Minimum 65 points required' : undefined,
        });
        recommendations.push({
            subclass: '190',
            name: 'Skilled Nominated',
            eligible: points.totalPoints >= 65,
        });
        if (points.regionalBonus || points.totalPoints >= 65) {
            recommendations.push({
                subclass: '491',
                name: 'Skilled Regional (Provisional)',
                eligible: true,
            });
        }
        return recommendations;
    }
};
exports.VisaRecommendationService = VisaRecommendationService;
exports.VisaRecommendationService = VisaRecommendationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(occupation_entity_1.Occupation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VisaRecommendationService);
//# sourceMappingURL=visa-recommendation.service.js.map