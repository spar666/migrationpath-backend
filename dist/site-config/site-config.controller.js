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
exports.SiteConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const auth_user_interface_1 = require("../common/interfaces/auth-user.interface");
const site_config_service_1 = require("./site-config.service");
const update_site_config_dto_1 = require("./dto/update-site-config.dto");
let SiteConfigController = class SiteConfigController {
    siteConfigService;
    constructor(siteConfigService) {
        this.siteConfigService = siteConfigService;
    }
    getPublicConfig() {
        return this.siteConfigService.getConfig();
    }
    getConfig() {
        return this.siteConfigService.getConfig();
    }
    updateConfig(dto, user) {
        return this.siteConfigService.updateConfig(dto, user.id);
    }
};
exports.SiteConfigController = SiteConfigController;
__decorate([
    (0, common_1.Get)('public/site-config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get published site configuration (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SiteConfigController.prototype, "getPublicConfig", null);
__decorate([
    (0, common_1.Get)('admin/site-config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get site configuration (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SiteConfigController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('admin/site-config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update the full site configuration' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_site_config_dto_1.UpdateSiteConfigDto,
        auth_user_interface_1.AuthUser]),
    __metadata("design:returntype", void 0)
], SiteConfigController.prototype, "updateConfig", null);
exports.SiteConfigController = SiteConfigController = __decorate([
    (0, swagger_1.ApiTags)('admin/site-config'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [site_config_service_1.SiteConfigService])
], SiteConfigController);
//# sourceMappingURL=site-config.controller.js.map