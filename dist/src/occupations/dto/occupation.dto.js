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
exports.UpdateOccupationDto = exports.CreateOccupationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const visa_mapping_1 = require("../constants/visa-mapping");
class CreateOccupationDto {
    anzscoCode;
    title;
    description;
    assessingAuthority;
    primaryList;
    pointsValue;
}
exports.CreateOccupationDto = CreateOccupationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '6-digit ANZSCO code (primary key)', example: '261313' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOccupationDto.prototype, "anzscoCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Software Engineer' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOccupationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOccupationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ACS' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOccupationDto.prototype, "assessingAuthority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: visa_mapping_1.SkilledList,
        description: 'Skilled list that classifies this occupation',
    }),
    (0, class_validator_1.IsEnum)(visa_mapping_1.SkilledList),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOccupationDto.prototype, "primaryList", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateOccupationDto.prototype, "pointsValue", void 0);
class UpdateOccupationDto extends (0, swagger_1.PartialType)(CreateOccupationDto) {
}
exports.UpdateOccupationDto = UpdateOccupationDto;
//# sourceMappingURL=occupation.dto.js.map