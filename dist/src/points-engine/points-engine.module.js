"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsEngineModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const points_engine_service_1 = require("./points-engine.service");
const points_engine_controller_1 = require("./points-engine.controller");
const points_config_repository_1 = require("./points-config.repository");
const points_config_entity_1 = require("./entities/points-config.entity");
const points_calculator_service_1 = require("./points-calculator/points-calculator.service");
const points_rule_entity_1 = require("./entities/points-rule.entity");
const points_rule_repository_1 = require("./points-rule.repository");
const points_rule_service_1 = require("./points-rule.service");
const user_points_entity_1 = require("./entities/user-points.entity");
const user_points_repository_1 = require("./user-points.repository");
const user_points_service_1 = require("./user-points.service");
let PointsEngineModule = class PointsEngineModule {
};
exports.PointsEngineModule = PointsEngineModule;
exports.PointsEngineModule = PointsEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([points_config_entity_1.PointsConfig, points_rule_entity_1.PointsRule, user_points_entity_1.UserPoints])],
        controllers: [points_engine_controller_1.PointsEngineController],
        providers: [
            points_engine_service_1.PointsEngineService,
            points_rule_service_1.PointsRuleService,
            points_config_repository_1.PointsConfigRepository,
            points_rule_repository_1.PointsRuleRepository,
            points_calculator_service_1.PointsCalculatorService,
            user_points_repository_1.UserPointsRepository,
            user_points_service_1.UserPointsService,
        ],
        exports: [
            points_engine_service_1.PointsEngineService,
            points_rule_service_1.PointsRuleService,
            points_config_repository_1.PointsConfigRepository,
            points_rule_repository_1.PointsRuleRepository,
            points_calculator_service_1.PointsCalculatorService,
            user_points_service_1.UserPointsService,
        ],
    })
], PointsEngineModule);
//# sourceMappingURL=points-engine.module.js.map