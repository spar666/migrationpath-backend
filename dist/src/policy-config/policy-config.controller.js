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
exports.PolicyConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const policy_config_service_1 = require("./policy-config.service");
const update_policy_config_dto_1 = require("./dto/update-policy-config.dto");
let PolicyConfigController = class PolicyConfigController {
    policyConfigService;
    constructor(policyConfigService) {
        this.policyConfigService = policyConfigService;
    }
    findAll() {
        return this.policyConfigService.findAll();
    }
    update(key, dto) {
        return this.policyConfigService.update(key, dto);
    }
};
exports.PolicyConfigController = PolicyConfigController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all admin-editable legislative constants' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PolicyConfigController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a legislative constant (value / source / effective date)' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_policy_config_dto_1.UpdatePolicyConfigDto]),
    __metadata("design:returntype", void 0)
], PolicyConfigController.prototype, "update", null);
exports.PolicyConfigController = PolicyConfigController = __decorate([
    (0, swagger_1.ApiTags)('admin/policy-config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Controller)('admin/policy-config'),
    __metadata("design:paramtypes", [policy_config_service_1.PolicyConfigService])
], PolicyConfigController);
//# sourceMappingURL=policy-config.controller.js.map