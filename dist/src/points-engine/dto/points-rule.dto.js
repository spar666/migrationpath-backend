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
exports.UpdatePointsRuleDto = exports.CreatePointsRuleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePointsRuleDto {
    visa_group;
    category;
    sub_category;
    attribute_label;
    min_value;
    max_value;
    points_value;
    is_active;
}
exports.CreatePointsRuleDto = CreatePointsRuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'GSM',
        description: 'Visa group (GSM, Business, Criteria_Only, Relationship, Sponsorship)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['GSM', 'Business', 'Criteria_Only', 'Relationship', 'Sponsorship']),
    __metadata("design:type", String)
], CreatePointsRuleDto.prototype, "visa_group", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'age', description: 'Rule category' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePointsRuleDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '25-32',
        description: 'Rule sub-category',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePointsRuleDto.prototype, "sub_category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '25-32',
        description: 'Human readable label',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePointsRuleDto.prototype, "attribute_label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 25,
        description: 'Minimum value for range-based rules',
        required: false,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePointsRuleDto.prototype, "min_value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 32,
        description: 'Maximum value for range-based rules',
        required: false,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePointsRuleDto.prototype, "max_value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30, description: 'Points awarded' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreatePointsRuleDto.prototype, "points_value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the rule is active',
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreatePointsRuleDto.prototype, "is_active", void 0);
class UpdatePointsRuleDto {
    visa_group;
    category;
    sub_category;
    attribute_label;
    min_value;
    max_value;
    points_value;
    is_active;
}
exports.UpdatePointsRuleDto = UpdatePointsRuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['GSM', 'Business', 'Criteria_Only', 'Relationship', 'Sponsorship']),
    __metadata("design:type", String)
], UpdatePointsRuleDto.prototype, "visa_group", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePointsRuleDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePointsRuleDto.prototype, "sub_category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePointsRuleDto.prototype, "attribute_label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePointsRuleDto.prototype, "min_value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePointsRuleDto.prototype, "max_value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePointsRuleDto.prototype, "points_value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdatePointsRuleDto.prototype, "is_active", void 0);
//# sourceMappingURL=points-rule.dto.js.map