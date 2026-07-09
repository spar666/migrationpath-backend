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
exports.AdvancedSearchDto = exports.FiltersDto = exports.SelectedOccupationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SelectedOccupationDto {
    occupation;
}
exports.SelectedOccupationDto = SelectedOccupationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Selected occupation label' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SelectedOccupationDto.prototype, "occupation", void 0);
class FiltersDto {
    isRegional;
    agePoints;
    englishPoints;
    visaSubclasses;
}
exports.FiltersDto = FiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by regional study eligibility' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FiltersDto.prototype, "isRegional", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Desired age points threshold' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FiltersDto.prototype, "agePoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Desired english points threshold' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FiltersDto.prototype, "englishPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Visa subclasses to include',
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], FiltersDto.prototype, "visaSubclasses", void 0);
class AdvancedSearchDto {
    q;
    selectedOccupation;
    filters;
    page = 1;
    limit = 10;
}
exports.AdvancedSearchDto = AdvancedSearchDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Free text search' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdvancedSearchDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Selected occupation object',
        type: SelectedOccupationDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SelectedOccupationDto),
    __metadata("design:type", SelectedOccupationDto)
], AdvancedSearchDto.prototype, "selectedOccupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filters object', type: FiltersDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FiltersDto),
    __metadata("design:type", FiltersDto)
], AdvancedSearchDto.prototype, "filters", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdvancedSearchDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Results per page', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdvancedSearchDto.prototype, "limit", void 0);
//# sourceMappingURL=advanced-search.dto.js.map