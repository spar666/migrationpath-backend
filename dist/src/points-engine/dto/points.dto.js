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
exports.PointsResultDto = exports.BusinessPointsInputDto = exports.PointsInputDto = exports.EnglishLevel = exports.VisaGroup = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var VisaGroup;
(function (VisaGroup) {
    VisaGroup["GSM"] = "GSM";
    VisaGroup["Business"] = "Business";
    VisaGroup["Criteria_Only"] = "Criteria_Only";
    VisaGroup["Relationship"] = "Relationship";
    VisaGroup["Sponsorship"] = "Sponsorship";
})(VisaGroup || (exports.VisaGroup = VisaGroup = {}));
var EnglishLevel;
(function (EnglishLevel) {
    EnglishLevel["Competent"] = "competent";
    EnglishLevel["Proficient"] = "proficient";
    EnglishLevel["Superior"] = "superior";
})(EnglishLevel || (exports.EnglishLevel = EnglishLevel = {}));
class PointsInputDto {
    visaGroup;
    subclass;
    age;
    englishLevel;
    educationLevel;
    workExperienceOverseas;
    workExperienceAustralia;
    skilledDate;
    australianStudyRequirement;
    isRegional;
    professionalYear;
    partnerSkills;
    naati;
    stemResearch;
}
exports.PointsInputDto = PointsInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Visa group selection', enum: VisaGroup }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PointsInputDto.prototype, "visaGroup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Specific visa subclass (189, 190, 491, 188, etc.)',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PointsInputDto.prototype, "subclass", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Applicant age' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18),
    __metadata("design:type", Number)
], PointsInputDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'English proficiency level', enum: EnglishLevel }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PointsInputDto.prototype, "englishLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Education level achieved' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PointsInputDto.prototype, "educationLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Overseas work experience in years (last 10 years)',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], PointsInputDto.prototype, "workExperienceOverseas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Australian work experience in years (last 10 years)',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], PointsInputDto.prototype, "workExperienceAustralia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Date became skilled (per skills assessment)',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PointsInputDto.prototype, "skilledDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Meets Australian study requirement' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PointsInputDto.prototype, "australianStudyRequirement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Studied in regional Australia' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PointsInputDto.prototype, "isRegional", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Completed Professional Year' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PointsInputDto.prototype, "professionalYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Partner skill level (single_spouse, skills_english, english_only)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PointsInputDto.prototype, "partnerSkills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passed NAATI CCL' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PointsInputDto.prototype, "naati", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'STEM Research qualification' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PointsInputDto.prototype, "stemResearch", void 0);
class BusinessPointsInputDto {
    visaGroup = 'Business';
    turnover;
    netAssets;
    hasPatent;
    exportTrade;
    highGrowth;
}
exports.BusinessPointsInputDto = BusinessPointsInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Visa group (Business)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessPointsInputDto.prototype, "visaGroup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business turnover in USD' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BusinessPointsInputDto.prototype, "turnover", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net assets in USD' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BusinessPointsInputDto.prototype, "netAssets", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has registered patent' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BusinessPointsInputDto.prototype, "hasPatent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Export trade business' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BusinessPointsInputDto.prototype, "exportTrade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'High growth business' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BusinessPointsInputDto.prototype, "highGrowth", void 0);
class PointsResultDto {
    totalPoints;
    breakdown;
    regionalBonus;
    prAdvantageBadge;
    ineligibilityReason;
    belowPassMark;
}
exports.PointsResultDto = PointsResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total points calculated' }),
    __metadata("design:type", Number)
], PointsResultDto.prototype, "totalPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Breakdown of points by category' }),
    __metadata("design:type", Object)
], PointsResultDto.prototype, "breakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether regional bonus applies' }),
    __metadata("design:type", Boolean)
], PointsResultDto.prototype, "regionalBonus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether eligible for PR advantage badge' }),
    __metadata("design:type", Boolean)
], PointsResultDto.prototype, "prAdvantageBadge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ineligible reason if applicable' }),
    __metadata("design:type", String)
], PointsResultDto.prototype, "ineligibilityReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether score is below pass mark (65)' }),
    __metadata("design:type", Boolean)
], PointsResultDto.prototype, "belowPassMark", void 0);
//# sourceMappingURL=points.dto.js.map