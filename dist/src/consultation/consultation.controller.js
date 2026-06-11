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
exports.ConsultationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const consultation_service_1 = require("./consultation.service");
const submit_questionnaire_dto_1 = require("./dto/submit-questionnaire.dto");
const deliver_strategy_dto_1 = require("./dto/deliver-strategy.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const auth_user_interface_1 = require("../common/interfaces/auth-user.interface");
let ConsultationController = class ConsultationController {
    consultationService;
    constructor(consultationService) {
        this.consultationService = consultationService;
    }
    submitQuestionnaire(user, dto) {
        return this.consultationService.submitQuestionnaire(user.id, dto.responses);
    }
    findMyQuestionnaire(user) {
        return this.consultationService.findMyQuestionnaire(user.id);
    }
    findUserQuestionnaire(userId) {
        return this.consultationService.findMyQuestionnaire(userId);
    }
    findAllQuestionnaires(query) {
        return this.consultationService.findAllQuestionnaires(query.page ?? 1, query.limit ?? 20);
    }
    findAll(query) {
        return this.consultationService.findAllBookings(query.page ?? 1, query.limit ?? 20);
    }
    deliverStrategy(id, dto) {
        return this.consultationService.deliverStrategy(id, dto.strategy);
    }
    remove(id) {
        return this.consultationService.deleteBooking(id);
    }
};
exports.ConsultationController = ConsultationController;
__decorate([
    (0, common_1.Post)('questionnaire'),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit consultation questionnaire (authenticated)',
    }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser,
        submit_questionnaire_dto_1.SubmitQuestionnaireDto]),
    __metadata("design:returntype", void 0)
], ConsultationController.prototype, "submitQuestionnaire", null);
__decorate([
    (0, common_1.Get)('questionnaire/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my latest questionnaire (authenticated)' }),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_user_interface_1.AuthUser]),
    __metadata("design:returntype", void 0)
], ConsultationController.prototype, "findMyQuestionnaire", null);
__decorate([
    (0, common_1.Get)('questionnaire/user/:userId'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get questionnaire for a specific user (admin only)' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConsultationController.prototype, "findUserQuestionnaire", null);
__decorate([
    (0, common_1.Get)('questionnaire'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'List all consultation questionnaires (admin only)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], ConsultationController.prototype, "findAllQuestionnaires", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'List all consultation bookings (admin only)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], ConsultationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/strategy'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Deliver strategy to client (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deliver_strategy_dto_1.DeliverStrategyDto]),
    __metadata("design:returntype", void 0)
], ConsultationController.prototype, "deliverStrategy", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a consultation booking (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConsultationController.prototype, "remove", null);
exports.ConsultationController = ConsultationController = __decorate([
    (0, swagger_1.ApiTags)('consultation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('consultation'),
    __metadata("design:paramtypes", [consultation_service_1.ConsultationService])
], ConsultationController);
//# sourceMappingURL=consultation.controller.js.map