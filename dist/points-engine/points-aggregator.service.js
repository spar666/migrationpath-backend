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
exports.PointsAggregatorService = void 0;
const common_1 = require("@nestjs/common");
const points_rule_repository_1 = require("./points-rule.repository");
const points_catalogue_1 = require("./constants/points-catalogue");
const policy_config_service_1 = require("../policy-config/policy-config.service");
let PointsAggregatorService = class PointsAggregatorService {
    ruleRepo;
    policyConfig;
    constructor(ruleRepo, policyConfig) {
        this.ruleRepo = ruleRepo;
        this.policyConfig = policyConfig;
    }
    async calculateTotalPoints(profile) {
        const visaGroup = profile.visaGroup || points_catalogue_1.DEFAULT_VISA_GROUP;
        const rules = await this.ruleRepo.findActive(visaGroup);
        const workCap = await this.policyConfig.getNumber('points.combinedWorkCap', points_catalogue_1.COMBINED_WORK_POINTS_CAP);
        const passMark = await this.policyConfig.getNumber('points.gsmPassMark', points_catalogue_1.GSM_PASS_MARK);
        const rangePoints = (category, value) => {
            const rule = rules.find((r) => r.category === category &&
                r.is_active &&
                r.min_value !== null &&
                r.max_value !== null &&
                value >= r.min_value &&
                value <= r.max_value);
            return rule ? rule.points_value : 0;
        };
        const labelPoints = (category, label) => {
            const rule = rules.find((r) => r.category === category &&
                r.is_active &&
                r.attribute_label === label);
            return rule ? rule.points_value : 0;
        };
        const agePoints = rangePoints(points_catalogue_1.PointsCategory.AGE, profile.age);
        const englishPoints = labelPoints(points_catalogue_1.PointsCategory.ENGLISH, profile.englishLevel);
        const qualificationPoints = labelPoints(points_catalogue_1.PointsCategory.QUALIFICATIONS, profile.qualification);
        const overseasWorkPoints = rangePoints(points_catalogue_1.PointsCategory.OVERSEAS_WORK, profile.overseasWorkYears);
        const australianWorkPoints = rangePoints(points_catalogue_1.PointsCategory.AUSTRALIAN_WORK, profile.australianWorkYears);
        const regionalStudyPoints = profile.regionalStudy
            ? labelPoints(points_catalogue_1.PointsCategory.REGIONAL_STUDY, 'regional')
            : 0;
        const combinedWorkRaw = overseasWorkPoints + australianWorkPoints;
        const combinedWorkPoints = Math.min(combinedWorkRaw, workCap);
        const workCapApplied = combinedWorkRaw > workCap;
        const totalPoints = agePoints +
            englishPoints +
            qualificationPoints +
            combinedWorkPoints +
            regionalStudyPoints;
        const breakdown = {
            [points_catalogue_1.PointsCategory.AGE]: agePoints,
            [points_catalogue_1.PointsCategory.ENGLISH]: englishPoints,
            [points_catalogue_1.PointsCategory.QUALIFICATIONS]: qualificationPoints,
            [points_catalogue_1.PointsCategory.OVERSEAS_WORK]: overseasWorkPoints,
            [points_catalogue_1.PointsCategory.AUSTRALIAN_WORK]: australianWorkPoints,
            WORK_EXPERIENCE_COMBINED: combinedWorkPoints,
            [points_catalogue_1.PointsCategory.REGIONAL_STUDY]: regionalStudyPoints,
        };
        const ineligibilityReason = visaGroup === points_catalogue_1.DEFAULT_VISA_GROUP && profile.age >= points_catalogue_1.GSM_MAX_AGE
            ? `Ineligible: applicants must be under ${points_catalogue_1.GSM_MAX_AGE} for GSM subclasses.`
            : undefined;
        return {
            totalPoints,
            breakdown,
            workCapApplied,
            belowPassMark: totalPoints < passMark,
            ineligibilityReason,
        };
    }
};
exports.PointsAggregatorService = PointsAggregatorService;
exports.PointsAggregatorService = PointsAggregatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [points_rule_repository_1.PointsRuleRepository,
        policy_config_service_1.PolicyConfigService])
], PointsAggregatorService);
//# sourceMappingURL=points-aggregator.service.js.map