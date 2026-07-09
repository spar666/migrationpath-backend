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
exports.UpdateSiteConfigDto = exports.FooterConfigDto = exports.HomePageConfigDto = exports.PageConfigDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PageConfigDto {
    heroHeadline;
    heroSubtext;
    heroImage;
    primaryCta;
    secondaryCta;
    benefits;
}
exports.PageConfigDto = PageConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hero headline text' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageConfigDto.prototype, "heroHeadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hero subtext / description' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageConfigDto.prototype, "heroSubtext", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hero image (base64 data URL or empty)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PageConfigDto.prototype, "heroImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Primary CTA button label' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageConfigDto.prototype, "primaryCta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Secondary CTA button label' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageConfigDto.prototype, "secondaryCta", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'List of benefit/feature bullet points',
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], PageConfigDto.prototype, "benefits", void 0);
class HomePageConfigDto extends PageConfigDto {
    outlookTitle;
    outlookDescription;
    processingTimeHealthcare;
    processingTimeTech;
}
exports.HomePageConfigDto = HomePageConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Migration outlook section title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomePageConfigDto.prototype, "outlookTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Migration outlook section description' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomePageConfigDto.prototype, "outlookDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Healthcare processing time display text' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomePageConfigDto.prototype, "processingTimeHealthcare", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tech processing time display text' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomePageConfigDto.prototype, "processingTimeTech", void 0);
class FooterConfigDto {
    maraStatement;
    quickLinks;
    resourceLinks;
}
exports.FooterConfigDto = FooterConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MARA compliance statement' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FooterConfigDto.prototype, "maraStatement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Quick links for footer navigation',
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FooterConfigDto.prototype, "quickLinks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Resource links for footer',
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FooterConfigDto.prototype, "resourceLinks", void 0);
class UpdateSiteConfigDto {
    home;
    student;
    skilled;
    partner;
    onshore;
    footer;
}
exports.UpdateSiteConfigDto = UpdateSiteConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Home page configuration', type: HomePageConfigDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => HomePageConfigDto),
    (0, class_validator_1.IsNotEmptyObject)(),
    __metadata("design:type", HomePageConfigDto)
], UpdateSiteConfigDto.prototype, "home", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student page configuration', type: PageConfigDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PageConfigDto),
    (0, class_validator_1.IsNotEmptyObject)(),
    __metadata("design:type", PageConfigDto)
], UpdateSiteConfigDto.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Skilled page configuration', type: PageConfigDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PageConfigDto),
    (0, class_validator_1.IsNotEmptyObject)(),
    __metadata("design:type", PageConfigDto)
], UpdateSiteConfigDto.prototype, "skilled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Partner page configuration', type: PageConfigDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PageConfigDto),
    (0, class_validator_1.IsNotEmptyObject)(),
    __metadata("design:type", PageConfigDto)
], UpdateSiteConfigDto.prototype, "partner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Onshore page configuration', type: PageConfigDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PageConfigDto),
    (0, class_validator_1.IsNotEmptyObject)(),
    __metadata("design:type", PageConfigDto)
], UpdateSiteConfigDto.prototype, "onshore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Footer configuration', type: FooterConfigDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FooterConfigDto),
    (0, class_validator_1.IsNotEmptyObject)(),
    __metadata("design:type", FooterConfigDto)
], UpdateSiteConfigDto.prototype, "footer", void 0);
//# sourceMappingURL=update-site-config.dto.js.map