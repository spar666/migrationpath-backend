"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisaRecommendationModule = void 0;
const common_1 = require("@nestjs/common");
const visa_recommendation_service_1 = require("./visa-recommendation.service");
const visa_recommendation_controller_1 = require("./visa-recommendation.controller");
const occupations_module_1 = require("../occupations/occupations.module");
const policy_config_module_1 = require("../policy-config/policy-config.module");
let VisaRecommendationModule = class VisaRecommendationModule {
};
exports.VisaRecommendationModule = VisaRecommendationModule;
exports.VisaRecommendationModule = VisaRecommendationModule = __decorate([
    (0, common_1.Module)({
        imports: [occupations_module_1.OccupationsModule, policy_config_module_1.PolicyConfigModule],
        controllers: [visa_recommendation_controller_1.VisaRecommendationController],
        providers: [visa_recommendation_service_1.VisaRecommendationService],
        exports: [visa_recommendation_service_1.VisaRecommendationService],
    })
], VisaRecommendationModule);
//# sourceMappingURL=visa-recommendation.module.js.map