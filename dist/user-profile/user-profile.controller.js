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
exports.UserProfileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const user_profile_service_1 = require("./user-profile.service");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const auth_user_interface_1 = require("../common/interfaces/auth-user.interface");
let UserProfileController = class UserProfileController {
    userProfileService;
    constructor(userProfileService) {
        this.userProfileService = userProfileService;
    }
    getMyProfile(user) {
        return this.userProfileService.getMyProfile(user.id);
    }
    updateMyProfile(user, dto) {
        return this.userProfileService.updateMyProfile(user.id, dto);
    }
    updateMyProfilePut(user, dto) {
        return this.userProfileService.updateMyProfile(user.id, dto);
    }
    getPreferences(user) {
        return this.userProfileService.getPreferences(user.id);
    }
    updatePreferences(user, dto) {
        return this.userProfileService.updatePreferences(user.id, dto);
    }
    changePassword(user, dto) {
        return this.userProfileService.changePassword(user.id, dto.oldPassword, dto.newPassword);
    }
    uploadAvatar(user, file) {
        const avatarUrl = `/uploads/${file?.originalname || 'avatar.png'}`;
        return this.userProfileService.updateAvatar(user.id, avatarUrl);
    }
    deleteAccount(user, confirmPassword) {
        return this.userProfileService.deleteAccount(user.id, confirmPassword);
    }
    getUserById(id) {
        return this.userProfileService.getUserById(id);
    }
    getAllProfiles(query) {
        return this.userProfileService.getAllProfiles(query.page ?? 1, query.limit ?? 20);
    }
};
exports.UserProfileController = UserProfileController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my profile' }),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update my profile' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update my profile' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "updateMyProfilePut", null);
__decorate([
    (0, common_1.Get)('me/preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my user preferences' }),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Put)('me/preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Update my user preferences' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, Object]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Post)('me/change-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Change password' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, Object]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('me/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload avatar' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, Object]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete account' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('confirmPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'List all profiles (admin only)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], UserProfileController.prototype, "getAllProfiles", null);
exports.UserProfileController = UserProfileController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_profile_service_1.UserProfileService])
], UserProfileController);
//# sourceMappingURL=user-profile.controller.js.map