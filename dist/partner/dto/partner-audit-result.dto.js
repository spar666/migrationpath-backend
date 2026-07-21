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
exports.PartnerAuditResultDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PartnerAuditResultDto {
    auditId;
    overallReadiness;
    pillars;
    predictedVisa;
    legislativeWaiverApplied;
    commitmentStatus;
    recommendations;
}
exports.PartnerAuditResultDto = PartnerAuditResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Persisted audit id' }),
    __metadata("design:type", String)
], PartnerAuditResultDto.prototype, "auditId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall application readiness percentage (0-100)' }),
    __metadata("design:type", Number)
], PartnerAuditResultDto.prototype, "overallReadiness", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Per-pillar results (financial, household, social, commitment)' }),
    __metadata("design:type", Array)
], PartnerAuditResultDto.prototype, "pillars", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Predicted visa path based on physical location' }),
    __metadata("design:type", Object)
], PartnerAuditResultDto.prototype, "predictedVisa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'True when the BDM registration waiver unlocks the commitment track despite <12 months cohabitation',
    }),
    __metadata("design:type", Boolean)
], PartnerAuditResultDto.prototype, "legislativeWaiverApplied", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commitment track status', enum: ['LEGALLY UNLOCKED', 'STANDARD'] }),
    __metadata("design:type", String)
], PartnerAuditResultDto.prototype, "commitmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Targeted, actionable legal recommendations', type: [String] }),
    __metadata("design:type", Array)
], PartnerAuditResultDto.prototype, "recommendations", void 0);
//# sourceMappingURL=partner-audit-result.dto.js.map