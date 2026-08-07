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
exports.ImportOccupationListsDto = exports.ImportOccupationListRow = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const visa_mapping_1 = require("../constants/visa-mapping");
class ImportOccupationListRow {
    anzscoCode;
    primaryList;
}
exports.ImportOccupationListRow = ImportOccupationListRow;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '261313' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportOccupationListRow.prototype, "anzscoCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: visa_mapping_1.SkilledList }),
    (0, class_validator_1.IsEnum)(visa_mapping_1.SkilledList),
    __metadata("design:type", String)
], ImportOccupationListRow.prototype, "primaryList", void 0);
class ImportOccupationListsDto {
    resyncVisas;
    rows;
}
exports.ImportOccupationListsDto = ImportOccupationListsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Re-resolve visa links from the matrix after import',
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ImportOccupationListsDto.prototype, "resyncVisas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ImportOccupationListRow] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ImportOccupationListRow),
    __metadata("design:type", Array)
], ImportOccupationListsDto.prototype, "rows", void 0);
//# sourceMappingURL=import-occupation-lists.dto.js.map