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
exports.PartnerProfileDto = exports.ApplicantLocation = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ApplicantLocation;
(function (ApplicantLocation) {
    ApplicantLocation["ONSHORE"] = "onshore";
    ApplicantLocation["OFFSHORE"] = "offshore";
})(ApplicantLocation || (exports.ApplicantLocation = ApplicantLocation = {}));
class PartnerProfileDto {
    currentLocation;
    jointBankAccounts;
    jointLeaseOrMortgage;
    sharedUtilityBills;
    sharedDomesticBills;
    jointChildResponsibility;
    matchingAddressHistory;
    sharedTravelItineraries;
    form888Count;
    jointSocialInvitations;
    livedTogether12Months;
    registeredRelationshipBDM;
}
exports.PartnerProfileDto = PartnerProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ApplicantLocation,
        description: 'Applicant physical location (drives 820 vs 309)',
    }),
    (0, class_validator_1.IsEnum)(ApplicantLocation),
    __metadata("design:type", String)
], PartnerProfileDto.prototype, "currentLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Holds joint bank account(s)' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "jointBankAccounts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Joint lease or mortgage in both names' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "jointLeaseOrMortgage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shared utility bills' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "sharedUtilityBills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shared responsibility for domestic bills' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "sharedDomesticBills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Joint responsibility for children' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "jointChildResponsibility", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Matching historical address log' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "matchingAddressHistory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shared travel itineraries' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "sharedTravelItineraries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of Form 888 statutory declarations available from Australian citizens/PRs',
        default: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PartnerProfileDto.prototype, "form888Count", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Joint social invitations addressed to both' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "jointSocialInvitations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lived together for 12+ months' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "livedTogether12Months", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'De facto relationship registered with an Australian State/Territory BDM',
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PartnerProfileDto.prototype, "registeredRelationshipBDM", void 0);
//# sourceMappingURL=partner-profile.dto.js.map