"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostcodeModule = void 0;
const common_1 = require("@nestjs/common");
const postcode_validator_service_1 = require("./postcode-validator.service");
const regional_postcode_module_1 = require("../regional-postcode/regional-postcode.module");
let PostcodeModule = class PostcodeModule {
};
exports.PostcodeModule = PostcodeModule;
exports.PostcodeModule = PostcodeModule = __decorate([
    (0, common_1.Module)({
        imports: [regional_postcode_module_1.RegionalPostcodeModule],
        providers: [postcode_validator_service_1.PostcodeValidatorService],
        exports: [postcode_validator_service_1.PostcodeValidatorService],
    })
], PostcodeModule);
//# sourceMappingURL=postcode.module.js.map