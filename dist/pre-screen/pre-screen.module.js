"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreScreenModule = void 0;
const common_1 = require("@nestjs/common");
const pre_screen_service_1 = require("./pre-screen.service");
const pre_screen_controller_1 = require("./pre-screen.controller");
const prospect_module_1 = require("../prospect/prospect.module");
const employer_sponsored_module_1 = require("../employer-sponsored/employer-sponsored.module");
let PreScreenModule = class PreScreenModule {
};
exports.PreScreenModule = PreScreenModule;
exports.PreScreenModule = PreScreenModule = __decorate([
    (0, common_1.Module)({
        imports: [prospect_module_1.ProspectModule, employer_sponsored_module_1.EmployerSponsoredModule],
        controllers: [pre_screen_controller_1.PreScreenController],
        providers: [pre_screen_service_1.PreScreenService],
        exports: [pre_screen_service_1.PreScreenService],
    })
], PreScreenModule);
//# sourceMappingURL=pre-screen.module.js.map