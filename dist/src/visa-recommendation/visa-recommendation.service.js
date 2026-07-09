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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisaRecommendationService = void 0;
const common_1 = require("@nestjs/common");
const occupations_service_1 = require("../occupations/occupations.service");
const policy_config_service_1 = require("../policy-config/policy-config.service");
const POINTS_TESTED_SUBCLASSES = new Set(['189', '190', '491', '485']);
let VisaRecommendationService = class VisaRecommendationService {
    occupationsService;
    policyConfig;
    constructor(occupationsService, policyConfig) {
        this.occupationsService = occupationsService;
        this.policyConfig = policyConfig;
    }
    async recommend(anzscoCode, points) {
        const eligibleVisas = await this.occupationsService.getEligibleVisas(anzscoCode);
        if (!eligibleVisas.length)
            return [];
        const passMark = await this.policyConfig.getNumber('points.gsmPassMark', 65);
        const meetsPassMark = points.totalPoints >= passMark;
        return eligibleVisas.map((visa) => {
            const isPointsTested = POINTS_TESTED_SUBCLASSES.has(visa.subclassNumber);
            if (!isPointsTested) {
                return {
                    subclass: visa.subclassNumber,
                    name: visa.name ?? visa.streamTitle,
                    eligible: true,
                    reason: 'Employer-sponsored / nomination pathway — not points-tested',
                };
            }
            const eligible = meetsPassMark ||
                (visa.subclassNumber === '491' && !!points.regionalBonus);
            return {
                subclass: visa.subclassNumber,
                name: visa.name ?? visa.streamTitle,
                eligible,
                reason: eligible ? undefined : `Minimum ${passMark} points required`,
            };
        });
    }
};
exports.VisaRecommendationService = VisaRecommendationService;
exports.VisaRecommendationService = VisaRecommendationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [occupations_service_1.OccupationsService,
        policy_config_service_1.PolicyConfigService])
], VisaRecommendationService);
//# sourceMappingURL=visa-recommendation.service.js.map