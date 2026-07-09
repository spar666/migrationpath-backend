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
exports.NewsArticleQueryDto = exports.GuideQueryDto = exports.FaqQueryDto = exports.CmsPaginationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CmsPaginationDto {
    page = 1;
    pageSize = 25;
}
exports.CmsPaginationDto = CmsPaginationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CmsPaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 25 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CmsPaginationDto.prototype, "pageSize", void 0);
class FaqQueryDto extends CmsPaginationDto {
    category;
    persona;
}
exports.FaqQueryDto = FaqQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['General', 'Visa', 'Points', 'Consultation'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FaqQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['Skilled', 'Student', 'Graduate', 'All'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FaqQueryDto.prototype, "persona", void 0);
class GuideQueryDto extends CmsPaginationDto {
    category;
    persona;
    difficulty;
}
exports.GuideQueryDto = GuideQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['General', 'Visa', 'PR', 'State'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuideQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['Skilled', 'Student', 'Graduate'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuideQueryDto.prototype, "persona", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['Beginner', 'Intermediate', 'Advanced'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuideQueryDto.prototype, "difficulty", void 0);
class NewsArticleQueryDto extends CmsPaginationDto {
    category;
    target_persona;
}
exports.NewsArticleQueryDto = NewsArticleQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['Visa', 'PR Pathway', 'State Nomination', 'Other'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewsArticleQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['Skilled', 'Student', 'Graduate'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewsArticleQueryDto.prototype, "target_persona", void 0);
//# sourceMappingURL=cms-query.dto.js.map