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
exports.CreatePackageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePackageDto {
    package_name;
    visa_subclass;
    category;
    professional_fees;
    government_charges;
    estimated_extras;
    inclusions;
    is_active;
    display_order;
}
exports.CreatePackageDto = CreatePackageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "package_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Visa subclass code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "visa_subclass", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Package category',
        enum: ['student', 'skilled', 'family', 'employer'],
    }),
    (0, class_validator_1.IsEnum)(['student', 'skilled', 'family', 'employer']),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Professional fees amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "professional_fees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Government charges amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "government_charges", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated extras amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "estimated_extras", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of inclusions', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePackageDto.prototype, "inclusions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the package is active',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePackageDto.prototype, "is_active", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Display order', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "display_order", void 0);
//# sourceMappingURL=create-package.dto.js.map