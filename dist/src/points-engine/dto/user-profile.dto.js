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
exports.StructuredPointsResultDto = exports.UserProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const points_catalogue_1 = require("../constants/points-catalogue");
class UserProfileDto {
    visaGroup = points_catalogue_1.DEFAULT_VISA_GROUP;
    age;
    englishLevel;
    qualification;
    overseasWorkYears;
    australianWorkYears;
    regionalStudy;
}
exports.UserProfileDto = UserProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Visa group', default: points_catalogue_1.DEFAULT_VISA_GROUP }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "visaGroup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Applicant age in years', example: 29 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], UserProfileDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'English proficiency tier', enum: points_catalogue_1.EnglishProficiency }),
    (0, class_validator_1.IsEnum)(points_catalogue_1.EnglishProficiency),
    __metadata("design:type", String)
], UserProfileDto.prototype, "englishLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Highest recognised qualification', enum: points_catalogue_1.QualificationLevel }),
    (0, class_validator_1.IsEnum)(points_catalogue_1.QualificationLevel),
    __metadata("design:type", String)
], UserProfileDto.prototype, "qualification", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overseas skilled work experience (years, last 10)', example: 5 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], UserProfileDto.prototype, "overseasWorkYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Australian skilled work experience (years, last 10)', example: 2 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], UserProfileDto.prototype, "australianWorkYears", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Completed study in a designated regional area' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserProfileDto.prototype, "regionalStudy", void 0);
class StructuredPointsResultDto {
    totalPoints;
    breakdown;
    workCapApplied;
    belowPassMark;
    ineligibilityReason;
}
exports.StructuredPointsResultDto = StructuredPointsResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total aggregated points' }),
    __metadata("design:type", Number)
], StructuredPointsResultDto.prototype, "totalPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Points contributed per category',
        example: {
            AGE: 30,
            ENGLISH: 20,
            QUALIFICATIONS: 15,
            OVERSEAS_WORK: 10,
            AUSTRALIAN_WORK: 5,
            WORK_EXPERIENCE_COMBINED: 15,
            REGIONAL_STUDY: 5,
        },
    }),
    __metadata("design:type", Object)
], StructuredPointsResultDto.prototype, "breakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the 20-point combined work cap was applied' }),
    __metadata("design:type", Boolean)
], StructuredPointsResultDto.prototype, "workCapApplied", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the total is below the 65-point pass mark' }),
    __metadata("design:type", Boolean)
], StructuredPointsResultDto.prototype, "belowPassMark", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason the applicant is ineligible, if any' }),
    __metadata("design:type", String)
], StructuredPointsResultDto.prototype, "ineligibilityReason", void 0);
//# sourceMappingURL=user-profile.dto.js.map