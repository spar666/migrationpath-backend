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
exports.SaveProgressDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SaveProgressDto {
    title;
    current_step;
    anzsco_code;
    target_visa;
    calculated_points;
    data;
    is_completed;
}
exports.SaveProgressDto = SaveProgressDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'A user-friendly label for this saved progress, e.g. "My 189 Pathway"',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveProgressDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Current step in the journey',
        enum: [
            'search',
            'view_details',
            'points_calculator',
            'visa_recommendation',
            'completed',
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveProgressDto.prototype, "current_step", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ANZSCO occupation code being researched',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveProgressDto.prototype, "anzsco_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target visa subclass, e.g. "189"' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveProgressDto.prototype, "target_visa", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cached points score from calculator' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SaveProgressDto.prototype, "calculated_points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flexible JSON payload — search filters, viewed course IDs, calculator answers, etc.',
        example: {
            searched_occupation: 'Software Engineer',
            viewed_courses: ['uuid-1', 'uuid-2'],
            calculator_answers: { age: 32, english_level: 'superior' },
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SaveProgressDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Mark this progress record as completed',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveProgressDto.prototype, "is_completed", void 0);
//# sourceMappingURL=save-progress.dto.js.map