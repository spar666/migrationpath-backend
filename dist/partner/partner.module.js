"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const partner_controller_1 = require("./partner.controller");
const partner_audit_engine_1 = require("./partner-audit.engine");
const partner_audit_entity_1 = require("./entities/partner-audit.entity");
const partner_eligibility_submission_entity_1 = require("./entities/partner-eligibility-submission.entity");
const partner_eligibility_engine_1 = require("./partner-eligibility.engine");
const partner_eligibility_service_1 = require("./partner-eligibility.service");
const policy_config_module_1 = require("../policy-config/policy-config.module");
const leads_module_1 = require("../leads/leads.module");
let PartnerModule = class PartnerModule {
};
exports.PartnerModule = PartnerModule;
exports.PartnerModule = PartnerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([partner_audit_entity_1.PartnerAudit, partner_eligibility_submission_entity_1.PartnerEligibilitySubmission]),
            policy_config_module_1.PolicyConfigModule,
            leads_module_1.LeadsModule,
        ],
        controllers: [partner_controller_1.PartnerController],
        providers: [
            partner_audit_engine_1.PartnerAuditEngine,
            partner_eligibility_engine_1.PartnerEligibilityEngine,
            partner_eligibility_service_1.PartnerEligibilityService,
        ],
        exports: [partner_audit_engine_1.PartnerAuditEngine],
    })
], PartnerModule);
//# sourceMappingURL=partner.module.js.map