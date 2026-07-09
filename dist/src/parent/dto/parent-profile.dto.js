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
exports.ParentProfileDto = exports.SponsorStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var SponsorStatus;
(function (SponsorStatus) {
    SponsorStatus["CITIZEN"] = "citizen";
    SponsorStatus["PERMANENT_RESIDENT"] = "permanent_resident";
    SponsorStatus["ELIGIBLE_NZ"] = "eligible_nz";
    SponsorStatus["NONE"] = "none";
})(SponsorStatus || (exports.SponsorStatus = SponsorStatus = {}));
class ParentProfileDto {
    sponsorStatus;
    sponsorMonthsInAustralia;
    totalChildren;
    childrenInAustralia;
    childrenInLargestOtherCountry;
    sponsorTaxableIncome;
    parentAge;
}
exports.ParentProfileDto = ParentProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SponsorStatus, description: 'Sponsoring child status' }),
    (0, class_validator_1.IsEnum)(SponsorStatus),
    __metadata("design:type", String)
], ParentProfileDto.prototype, "sponsorStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Months the sponsoring child has lawfully resided in Australia',
        example: 30,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1200),
    __metadata("design:type", Number)
], ParentProfileDto.prototype, "sponsorMonthsInAustralia", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of children the parent has, globally' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], ParentProfileDto.prototype, "totalChildren", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Children who are permanent residents/citizens living in Australia',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], ParentProfileDto.prototype, "childrenInAustralia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of children living in the single other country with the most children (for the alternative limb of the test)',
        default: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ParentProfileDto.prototype, "childrenInLargestOtherCountry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Sponsor's current taxable income (AUD)", example: 72000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ParentProfileDto.prototype, "sponsorTaxableIncome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Age of the applying parent (years)', example: 68 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], ParentProfileDto.prototype, "parentAge", void 0);
//# sourceMappingURL=parent-profile.dto.js.map