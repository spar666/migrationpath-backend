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
exports.UpdateCourseDto = exports.CreateCourseDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCourseDto {
    universityName;
    courseTitle;
    anzscoCode;
    campusPostcode;
    isActive;
}
exports.CreateCourseDto = CreateCourseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'University of Melbourne' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "universityName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Master of Information Technology' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "courseTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '261313', description: 'Links the course to an occupation in the master' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "anzscoCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3220', description: '4-digit campus postcode (drives regional +5)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{3,4}$/, { message: 'campusPostcode must be a 3-4 digit postcode' }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "campusPostcode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourseDto.prototype, "isActive", void 0);
class UpdateCourseDto extends (0, swagger_1.PartialType)(CreateCourseDto) {
}
exports.UpdateCourseDto = UpdateCourseDto;
//# sourceMappingURL=course.dto.js.map