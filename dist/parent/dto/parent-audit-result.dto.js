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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentAuditResultDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ParentAuditResultDto {
    auditId;
    isEligible;
    status;
    balanceOfFamily;
    sponsorCheck;
    aos;
    predictedVisa;
    recommendations;
}
exports.ParentAuditResultDto = ParentAuditResultDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ParentAuditResultDto.prototype, "auditId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall eligibility flag (Gates 1 and 2 both pass)' }),
    __metadata("design:type", Boolean)
], ParentAuditResultDto.prototype, "isEligible", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['LEGALLY_ELIGIBLE', 'LEGALLY_INELIGIBLE'] }),
    __metadata("design:type", String)
], ParentAuditResultDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Balance of Family Test result' }),
    __metadata("design:type", Object)
], ParentAuditResultDto.prototype, "balanceOfFamily", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sponsor eligibility check (Gate 1)' }),
    __metadata("design:type", Object)
], ParentAuditResultDto.prototype, "sponsorCheck", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assurance of Support income check (Gate 3, warning-only)' }),
    __metadata("design:type", Object)
], ParentAuditResultDto.prototype, "aos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Predicted visa path based on age bracket' }),
    __metadata("design:type", Object)
], ParentAuditResultDto.prototype, "predictedVisa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], ParentAuditResultDto.prototype, "recommendations", void 0);
//# sourceMappingURL=parent-audit-result.dto.js.map