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
exports.PartnerController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const partner_audit_engine_1 = require("./partner-audit.engine");
const partner_profile_dto_1 = require("./dto/partner-profile.dto");
const partner_audit_result_dto_1 = require("./dto/partner-audit-result.dto");
const partner_eligibility_service_1 = require("./partner-eligibility.service");
const partner_eligibility_dto_1 = require("./dto/partner-eligibility.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
let PartnerController = class PartnerController {
    partnerAuditEngine;
    eligibilityService;
    constructor(partnerAuditEngine, eligibilityService) {
        this.partnerAuditEngine = partnerAuditEngine;
        this.eligibilityService = eligibilityService;
    }
    audit(profile) {
        return this.partnerAuditEngine.calculatePartnerReadiness(profile);
    }
    submitEligibility(dto) {
        return this.eligibilityService.submit(dto);
    }
    listEligibility(query) {
        return this.eligibilityService.findAll(query.page ?? 1, query.limit ?? 20);
    }
};
exports.PartnerController = PartnerController;
__decorate([
    (0, common_1.Post)('audit'),
    (0, common_1.HttpCode)(200),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Score partner-visa evidentiary readiness across the four legislative pillars (820/309)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, type: partner_audit_result_dto_1.PartnerAuditResultDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partner_profile_dto_1.PartnerProfileDto]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "audit", null);
__decorate([
    (0, common_1.Post)('eligibility'),
    (0, common_1.HttpCode)(200),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit the partner-visa eligibility quiz (820/801/309/100/300); computes and stores the outcome',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partner_eligibility_dto_1.PartnerEligibilityDto]),
    __metadata("design:returntype", void 0)
], PartnerController.prototype, "submitEligibility", null);
__decorate([
    (0, common_1.Get)('eligibility'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'List eligibility quiz submissions (admin only)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], PartnerController.prototype, "listEligibility", null);
exports.PartnerController = PartnerController = __decorate([
    (0, swagger_1.ApiTags)('partner'),
    (0, common_1.Controller)('partner'),
    __metadata("design:paramtypes", [partner_audit_engine_1.PartnerAuditEngine,
        partner_eligibility_service_1.PartnerEligibilityService])
], PartnerController);
//# sourceMappingURL=partner.controller.js.map