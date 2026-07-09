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
exports.ParentController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const parent_audit_engine_1 = require("./parent-audit.engine");
const parent_profile_dto_1 = require("./dto/parent-profile.dto");
const parent_audit_result_dto_1 = require("./dto/parent-audit-result.dto");
let ParentController = class ParentController {
    parentAuditEngine;
    constructor(parentAuditEngine) {
        this.parentAuditEngine = parentAuditEngine;
    }
    audit(profile) {
        return this.parentAuditEngine.calculateParentEligibility(profile);
    }
};
exports.ParentController = ParentController;
__decorate([
    (0, common_1.Post)('audit'),
    (0, common_1.HttpCode)(200),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Parent visa gateway: sponsor check, Balance of Family Test, and Assurance of Support income check (804/143)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, type: parent_audit_result_dto_1.ParentAuditResultDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [parent_profile_dto_1.ParentProfileDto]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "audit", null);
exports.ParentController = ParentController = __decorate([
    (0, swagger_1.ApiTags)('parent'),
    (0, common_1.Controller)('parent'),
    __metadata("design:paramtypes", [parent_audit_engine_1.ParentAuditEngine])
], ParentController);
//# sourceMappingURL=parent.controller.js.map