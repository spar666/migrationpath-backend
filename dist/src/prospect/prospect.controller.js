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
exports.ProspectController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const prospect_service_1 = require("./prospect.service");
const create_prospect_dto_1 = require("./dto/create-prospect.dto");
const report_booking_dto_1 = require("./dto/report-booking.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
let ProspectController = class ProspectController {
    prospectService;
    constructor(prospectService) {
        this.prospectService = prospectService;
    }
    async capture(dto) {
        const prospect = await this.prospectService.capture(dto);
        return {
            prospect_id: prospect.id,
            human_ref: prospect.human_ref,
            stage: prospect.stage,
        };
    }
    getPublicStatus(id, ref) {
        return this.prospectService.getPublicStatus(id, ref);
    }
    reportBooking(id, ref, dto) {
        return this.prospectService.reportBooking(id, ref, {
            inviteeUri: dto.invitee_uri,
            eventUri: dto.event_uri,
            startsAt: dto.starts_at,
            endsAt: dto.ends_at,
        });
    }
    list(query, stage, party) {
        const filters = {};
        if (stage)
            filters.stage = stage;
        if (party)
            filters.party = party;
        return this.prospectService.list(query.page ?? 1, query.limit ?? 20, filters);
    }
    getOne(id) {
        return this.prospectService.getPrepView(id);
    }
    getByRef(humanRef) {
        return this.prospectService.findByHumanRef(humanRef);
    }
    advance(id, stage) {
        return this.prospectService.advanceStage(id, stage);
    }
};
exports.ProspectController = ProspectController;
__decorate([
    (0, common_1.Post)(),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Capture a prospect from a calculator or partial form (public)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_prospect_dto_1.CreateProspectDto]),
    __metadata("design:returntype", Promise)
], ProspectController.prototype, "capture", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Read the funnel state of your own prospect record (public)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProspectController.prototype, "getPublicStatus", null);
__decorate([
    (0, common_1.Post)(':id/booking'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Report a consultation slot confirmed in the browser (public)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('ref')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, report_booking_dto_1.ReportBookingDto]),
    __metadata("design:returntype", void 0)
], ProspectController.prototype, "reportBooking", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'List prospects (admin only)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('stage')),
    __param(2, (0, common_1.Query)('party')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto, String, String]),
    __metadata("design:returntype", void 0)
], ProspectController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a prospect with its prep summary (admin only)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProspectController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)('ref/:humanRef'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Look a prospect up by its human reference (admin only)',
    }),
    __param(0, (0, common_1.Param)('humanRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProspectController.prototype, "getByRef", null);
__decorate([
    (0, common_1.Patch)(':id/stage'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Advance a prospect to a later stage (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('stage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProspectController.prototype, "advance", null);
exports.ProspectController = ProspectController = __decorate([
    (0, swagger_1.ApiTags)('prospects'),
    (0, common_1.Controller)('prospects'),
    __metadata("design:paramtypes", [prospect_service_1.ProspectService])
], ProspectController);
//# sourceMappingURL=prospect.controller.js.map