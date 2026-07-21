"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const parent_controller_1 = require("./parent.controller");
const parent_audit_engine_1 = require("./parent-audit.engine");
const parent_audit_entity_1 = require("./entities/parent-audit.entity");
const policy_config_module_1 = require("../policy-config/policy-config.module");
let ParentModule = class ParentModule {
};
exports.ParentModule = ParentModule;
exports.ParentModule = ParentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([parent_audit_entity_1.ParentAudit]), policy_config_module_1.PolicyConfigModule],
        controllers: [parent_controller_1.ParentController],
        providers: [parent_audit_engine_1.ParentAuditEngine],
        exports: [parent_audit_engine_1.ParentAuditEngine],
    })
], ParentModule);
//# sourceMappingURL=parent.module.js.map