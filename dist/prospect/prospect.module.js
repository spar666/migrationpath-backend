"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProspectModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const prospect_entity_1 = require("./entities/prospect.entity");
const prospect_summary_entity_1 = require("./entities/prospect-summary.entity");
const prospect_repository_1 = require("./prospect.repository");
const prospect_summary_repository_1 = require("./prospect-summary.repository");
const prospect_service_1 = require("./prospect.service");
const prospect_summary_service_1 = require("./prospect-summary.service");
const prospect_notifier_service_1 = require("./prospect-notifier.service");
const prospect_controller_1 = require("./prospect.controller");
const employer_sponsored_module_1 = require("../employer-sponsored/employer-sponsored.module");
const consultation_module_1 = require("../consultation/consultation.module");
let ProspectModule = class ProspectModule {
};
exports.ProspectModule = ProspectModule;
exports.ProspectModule = ProspectModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([prospect_entity_1.Prospect, prospect_summary_entity_1.ProspectSummary]),
            employer_sponsored_module_1.EmployerSponsoredModule,
            consultation_module_1.ConsultationModule,
        ],
        controllers: [prospect_controller_1.ProspectController],
        providers: [
            prospect_repository_1.ProspectRepository,
            prospect_summary_repository_1.ProspectSummaryRepository,
            prospect_service_1.ProspectService,
            prospect_summary_service_1.ProspectSummaryService,
            prospect_notifier_service_1.ProspectNotifierService,
        ],
        exports: [
            prospect_repository_1.ProspectRepository,
            prospect_summary_repository_1.ProspectSummaryRepository,
            prospect_service_1.ProspectService,
            prospect_summary_service_1.ProspectSummaryService,
            prospect_notifier_service_1.ProspectNotifierService,
        ],
    })
], ProspectModule);
//# sourceMappingURL=prospect.module.js.map