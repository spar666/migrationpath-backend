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
exports.PointsCalculatorService = void 0;
const common_1 = require("@nestjs/common");
const points_dto_1 = require("../dto/points.dto");
const points_config_repository_1 = require("../points-config.repository");
const points_rule_repository_1 = require("../points-rule.repository");
let PointsCalculatorService = class PointsCalculatorService {
    configRepo;
    ruleRepo;
    constructor(configRepo, ruleRepo) {
        this.configRepo = configRepo;
        this.ruleRepo = ruleRepo;
    }
    async calculatePoints(input) {
        const rules = await this.ruleRepo.findAll({
            is_active: true,
        });
        let totalPoints = 0;
        const breakdown = {};
        const getPointsFromRules = (category, attribute, value, visaGroup = input.visaGroup) => {
            const byAttr = rules.find((r) => r.category === category &&
                r.attribute_label === attribute &&
                r.visa_group === visaGroup &&
                r.is_active);
            if (byAttr)
                return byAttr.points_value;
            if (typeof value === 'number') {
                const matchedRule = rules.find((r) => r.category === category &&
                    r.min_value !== null &&
                    r.max_value !== null &&
                    value >= r.min_value &&
                    value <= r.max_value &&
                    r.visa_group === visaGroup &&
                    r.is_active);
                if (matchedRule)
                    return matchedRule.points_value;
            }
            return 0;
        };
        const addPoints = (category, attribute, numeric, points) => {
            if (points !== undefined) {
                const pts = points;
                breakdown[category] = pts;
                totalPoints += pts;
                return pts;
            }
            const pts = getPointsFromRules(category, attribute, numeric);
            breakdown[category] = pts;
            totalPoints += pts;
            return pts;
        };
        if (input.visaGroup === points_dto_1.VisaGroup.GSM) {
            if (input.age >= 45) {
                return {
                    totalPoints: 0,
                    breakdown: {},
                    regionalBonus: false,
                    prAdvantageBadge: false,
                    ineligibilityReason: 'Ineligible: Applicants must be under 45 for these subclasses.',
                };
            }
            const agePoints = addPoints('age', '', input.age);
            if (agePoints === 0 && input.age >= 45) {
                return {
                    totalPoints: 0,
                    breakdown: {},
                    regionalBonus: false,
                    prAdvantageBadge: false,
                    ineligibilityReason: 'Ineligible: Applicants must be under 45 for these subclasses.',
                };
            }
        }
        else {
            addPoints('age', '', input.age);
        }
        addPoints('english', input.englishLevel);
        addPoints('education', input.educationLevel);
        const ozYears = Math.min(input.workExperienceOverseas, 10);
        const ozPoints = getPointsFromRules('work_experience', 'overseas', ozYears);
        const ozAustraliaPoints = getPointsFromRules('work_experience', 'australia', input.workExperienceAustralia);
        let workPoints = ozPoints + ozAustraliaPoints;
        if (workPoints > 20)
            workPoints = 20;
        breakdown['work_experience'] = workPoints;
        totalPoints += workPoints;
        if (input.australianStudyRequirement) {
            const studyPoints = getPointsFromRules('australian_study', 'standard');
            breakdown['australian_study'] = studyPoints;
            totalPoints += studyPoints;
        }
        if (input.stemResearch) {
            addPoints('specialist_education', 'stem_research');
        }
        if (input.partnerSkills) {
            addPoints('partner', input.partnerSkills);
        }
        if (input.naati) {
            addPoints('naati', 'ccl');
        }
        if (input.professionalYear) {
            addPoints('professional_year', 'standard');
        }
        if (input.australianStudyRequirement && input.isRegional) {
            addPoints('regional_study', 'bonus');
        }
        const regionalBonus = !!(input.subclass === '491' || input.isRegional);
        if (input.subclass === '190' || input.subclass === '491') {
            addPoints('nomination', input.subclass);
        }
        return {
            totalPoints,
            breakdown,
            regionalBonus,
            prAdvantageBadge: regionalBonus || totalPoints >= 90,
            belowPassMark: totalPoints < 65,
        };
    }
    async calculateBusinessPoints(input) {
        const rules = await this.ruleRepo.findAll({
            is_active: true,
        });
        const breakdown = {};
        let totalPoints = 0;
        const getTurnoverPoints = (value) => {
            const rule = rules.find((r) => r.category === 'turnover' &&
                value >= r.min_value &&
                value <= r.max_value &&
                r.is_active);
            return rule ? rule.points_value : 0;
        };
        const getAssetsPoints = (value) => {
            const rule = rules.find((r) => r.category === 'net_assets' &&
                value >= r.min_value &&
                value <= r.max_value &&
                r.is_active);
            return rule ? rule.points_value : 0;
        };
        const turnoverPoints = getTurnoverPoints(input.turnover);
        breakdown['turnover'] = turnoverPoints;
        totalPoints += turnoverPoints;
        const assetsPoints = getAssetsPoints(input.netAssets);
        breakdown['net_assets'] = assetsPoints;
        totalPoints += assetsPoints;
        if (input.hasPatent) {
            breakdown['innovation_patent'] = 10;
            totalPoints += 10;
        }
        if (input.exportTrade) {
            breakdown['innovation_export'] = 5;
            totalPoints += 5;
        }
        if (input.highGrowth) {
            breakdown['innovation_high_growth'] = 10;
            totalPoints += 10;
        }
        return {
            totalPoints,
            breakdown,
            regionalBonus: false,
            prAdvantageBadge: false,
        };
    }
};
exports.PointsCalculatorService = PointsCalculatorService;
exports.PointsCalculatorService = PointsCalculatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [points_config_repository_1.PointsConfigRepository,
        points_rule_repository_1.PointsRuleRepository])
], PointsCalculatorService);
//# sourceMappingURL=points-calculator.service.js.map