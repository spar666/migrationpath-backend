"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionalPostcodeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const regional_postcode_band_entity_1 = require("./entities/regional-postcode-band.entity");
const regional_postcode_service_1 = require("./regional-postcode.service");
const regional_postcode_controller_1 = require("./regional-postcode.controller");
let RegionalPostcodeModule = class RegionalPostcodeModule {
};
exports.RegionalPostcodeModule = RegionalPostcodeModule;
exports.RegionalPostcodeModule = RegionalPostcodeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([regional_postcode_band_entity_1.RegionalPostcodeBand])],
        controllers: [regional_postcode_controller_1.RegionalPostcodeController],
        providers: [regional_postcode_service_1.RegionalPostcodeService],
        exports: [regional_postcode_service_1.RegionalPostcodeService],
    })
], RegionalPostcodeModule);
//# sourceMappingURL=regional-postcode.module.js.map