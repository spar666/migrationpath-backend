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
exports.CreateMigrationRuleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateMigrationRuleDto {
    persona_type;
    document_name;
    description;
    is_mandatory;
}
exports.CreateMigrationRuleDto = CreateMigrationRuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'student',
        description: 'Persona type (student, skilled, onshore, partner, employer)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['student', 'skilled', 'onshore', 'partner', 'employer']),
    __metadata("design:type", String)
], CreateMigrationRuleDto.prototype, "persona_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Passport', description: 'Document name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMigrationRuleDto.prototype, "document_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Valid passport with at least 6 months validity',
        description: 'Optional description',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMigrationRuleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the document is mandatory',
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateMigrationRuleDto.prototype, "is_mandatory", void 0);
//# sourceMappingURL=create-migration-rule.dto.js.map