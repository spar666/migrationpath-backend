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
exports.CompareScenariosDto = exports.SavePointsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SavePointsDto {
    selections;
    breakdown;
    personaType;
}
exports.SavePointsDto = SavePointsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The selections/answers that produced this score' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SavePointsDto.prototype, "selections", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full points breakdown result' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SavePointsDto.prototype, "breakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Persona type (student, skilled, onshore, etc.)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SavePointsDto.prototype, "personaType", void 0);
class CompareScenariosDto {
    scenarios;
    personaType;
}
exports.CompareScenariosDto = CompareScenariosDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of scenario inputs to compare' }),
    __metadata("design:type", Array)
], CompareScenariosDto.prototype, "scenarios", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Persona type for comparison' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompareScenariosDto.prototype, "personaType", void 0);
//# sourceMappingURL=save-points.dto.js.map