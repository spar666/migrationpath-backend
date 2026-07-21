"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyConfigModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const policy_config_entity_1 = require("./entities/policy-config.entity");
const policy_config_service_1 = require("./policy-config.service");
const policy_config_controller_1 = require("./policy-config.controller");
let PolicyConfigModule = class PolicyConfigModule {
};
exports.PolicyConfigModule = PolicyConfigModule;
exports.PolicyConfigModule = PolicyConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([policy_config_entity_1.PolicyConfig])],
        controllers: [policy_config_controller_1.PolicyConfigController],
        providers: [policy_config_service_1.PolicyConfigService],
        exports: [policy_config_service_1.PolicyConfigService],
    })
], PolicyConfigModule);
//# sourceMappingURL=policy-config.module.js.map