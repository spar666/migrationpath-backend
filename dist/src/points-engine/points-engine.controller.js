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
exports.PointsEngineController = void 0;
const common_1 = require("@nestjs/common");
const points_engine_service_1 = require("./points-engine.service");
const points_calculator_service_1 = require("./points-calculator/points-calculator.service");
const points_dto_1 = require("./dto/points.dto");
const save_points_dto_1 = require("./dto/save-points.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const auth_user_interface_1 = require("../common/interfaces/auth-user.interface");
const points_rule_service_1 = require("./points-rule.service");
const user_points_service_1 = require("./user-points.service");
let PointsEngineController = class PointsEngineController {
    pointsEngineService;
    calculator;
    pointsRuleService;
    userPointsService;
    constructor(pointsEngineService, calculator, pointsRuleService, userPointsService) {
        this.pointsEngineService = pointsEngineService;
        this.calculator = calculator;
        this.pointsRuleService = pointsRuleService;
        this.userPointsService = userPointsService;
    }
    calculate(input) {
        return this.calculator.calculatePoints(input);
    }
    calculateBusiness(input) {
        return this.calculator.calculateBusinessPoints(input);
    }
    getRules(visa_group) {
        return this.pointsRuleService.findActive(visa_group);
    }
    getConfig() {
        return this.pointsEngineService.findAllConfig();
    }
    updateConfig(id, dto) {
        return this.pointsEngineService.updateConfig(id, dto);
    }
    savePoints(user, dto) {
        return this.userPointsService.save(user.id, dto);
    }
    getMyPoints(user) {
        return this.userPointsService.getLatest(user.id);
    }
    getPointsHistory(user, limit) {
        return this.userPointsService.getHistory(user.id, limit ?? 10);
    }
    compareScenarios(user, dto) {
        return this.userPointsService.compareScenarios(user.id, dto);
    }
    getOccupationPoints(anzsco) {
        return this.userPointsService.getOccupationPoints(anzsco);
    }
    getEligibilityRanges() {
        return this.userPointsService.getEligibilityRanges();
    }
};
exports.PointsEngineController = PointsEngineController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate GSM points (public, stateless)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [points_dto_1.PointsInputDto]),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "calculate", null);
__decorate([
    (0, common_1.Post)('calculate/business'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate Business points (public, stateless)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [points_dto_1.BusinessPointsInputDto]),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "calculateBusiness", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active points rules (public)' }),
    (0, swagger_1.ApiQuery)({
        name: 'visa_group',
        required: false,
        description: 'Optional visa group to filter rules (e.g. GSM, Business)',
    }),
    __param(0, (0, common_1.Query)('visa_group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "getRules", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active points configuration (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Patch)('config/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update points configuration (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Post)('save'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Save points calculation to user profile' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, save_points_dto_1.SavePointsDto]),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "savePoints", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get my latest saved points calculation' }),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser]),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "getMyPoints", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get my points calculation history' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, Number]),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "getPointsHistory", null);
__decorate([
    (0, common_1.Post)('compare'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Compare points across different scenarios' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, save_points_dto_1.CompareScenariosDto]),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "compareScenarios", null);
__decorate([
    (0, common_1.Get)('occupation/:anzsco'),
    (0, swagger_1.ApiOperation)({ summary: 'Get occupation base points and modifiers' }),
    __param(0, (0, common_1.Param)('anzsco')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "getOccupationPoints", null);
__decorate([
    (0, common_1.Get)('eligibility-ranges'),
    (0, swagger_1.ApiOperation)({ summary: 'Get eligibility points ranges by visa type' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PointsEngineController.prototype, "getEligibilityRanges", null);
exports.PointsEngineController = PointsEngineController = __decorate([
    (0, swagger_1.ApiTags)('points-engine'),
    (0, common_1.Controller)('points'),
    __metadata("design:paramtypes", [points_engine_service_1.PointsEngineService,
        points_calculator_service_1.PointsCalculatorService,
        points_rule_service_1.PointsRuleService,
        user_points_service_1.UserPointsService])
], PointsEngineController);
//# sourceMappingURL=points-engine.controller.js.map