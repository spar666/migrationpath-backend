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
exports.BulkImportRegionalBandsDto = exports.UpdateRegionalBandDto = exports.CreateRegionalBandDto = exports.REGIONAL_CATEGORIES = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
exports.REGIONAL_CATEGORIES = ['METRO', 'CATEGORY_2', 'CATEGORY_3'];
class CreateRegionalBandDto {
    region;
    category;
    postcodeFrom;
    postcodeTo;
    isActive;
    effectiveDate;
    sourceNote;
}
exports.CreateRegionalBandDto = CreateRegionalBandDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Geelong' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRegionalBandDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: exports.REGIONAL_CATEGORIES }),
    (0, class_validator_1.IsIn)(exports.REGIONAL_CATEGORIES),
    __metadata("design:type", String)
], CreateRegionalBandDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3211 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(9999),
    __metadata("design:type", Number)
], CreateRegionalBandDto.prototype, "postcodeFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3230 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(9999),
    __metadata("design:type", Number)
], CreateRegionalBandDto.prototype, "postcodeTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateRegionalBandDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRegionalBandDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRegionalBandDto.prototype, "sourceNote", void 0);
class UpdateRegionalBandDto extends (0, swagger_1.PartialType)(CreateRegionalBandDto) {
}
exports.UpdateRegionalBandDto = UpdateRegionalBandDto;
class BulkImportRegionalBandsDto {
    replaceAll;
    rows;
}
exports.BulkImportRegionalBandsDto = BulkImportRegionalBandsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'If true, deactivate all existing bands before importing',
        default: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BulkImportRegionalBandsDto.prototype, "replaceAll", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateRegionalBandDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateRegionalBandDto),
    __metadata("design:type", Array)
], BulkImportRegionalBandsDto.prototype, "rows", void 0);
//# sourceMappingURL=regional-postcode.dto.js.map