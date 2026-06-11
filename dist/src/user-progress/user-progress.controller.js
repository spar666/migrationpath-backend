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
exports.UserProgressController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_progress_service_1 = require("./user-progress.service");
const save_progress_dto_1 = require("./dto/save-progress.dto");
const update_progress_dto_1 = require("./dto/update-progress.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_decorator_1 = require("../common/decorators/user.decorator");
const auth_user_interface_1 = require("../common/interfaces/auth-user.interface");
let UserProgressController = class UserProgressController {
    progressService;
    constructor(progressService) {
        this.progressService = progressService;
    }
    getMyProgress(user) {
        return this.progressService.getMyProgress(user.id);
    }
    getOne(user, id) {
        return this.progressService.getOne(user.id, id);
    }
    create(user, dto) {
        return this.progressService.create(user.id, dto);
    }
    update(user, id, dto) {
        return this.progressService.update(user.id, id, dto);
    }
    remove(user, id) {
        return this.progressService.remove(user.id, id);
    }
};
exports.UserProgressController = UserProgressController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all my saved progress records' }),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser]),
    __metadata("design:returntype", void 0)
], UserProgressController.prototype, "getMyProgress", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single saved progress record by ID' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], UserProgressController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Save a new progress record (from search or view-details page)',
    }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, save_progress_dto_1.SaveProgressDto]),
    __metadata("design:returntype", void 0)
], UserProgressController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a progress record (advance step, save calculator points)',
    }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, String, update_progress_dto_1.UpdateProgressDto]),
    __metadata("design:returntype", void 0)
], UserProgressController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a saved progress record' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser, String]),
    __metadata("design:returntype", void 0)
], UserProgressController.prototype, "remove", null);
exports.UserProgressController = UserProgressController = __decorate([
    (0, swagger_1.ApiTags)('user-progress'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users/me/progress'),
    __metadata("design:paramtypes", [user_progress_service_1.UserProgressService])
], UserProgressController);
//# sourceMappingURL=user-progress.controller.js.map