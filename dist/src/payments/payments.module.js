"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const payment_repository_1 = require("./payment.repository");
const payments_service_1 = require("./payments.service");
const payment_reconciliation_service_1 = require("./payment-reconciliation.service");
const payments_controller_1 = require("./payments.controller");
const prospect_module_1 = require("../prospect/prospect.module");
const consultation_module_1 = require("../consultation/consultation.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payment_entity_1.Payment]),
            prospect_module_1.ProspectModule,
            consultation_module_1.ConsultationModule,
        ],
        controllers: [payments_controller_1.PaymentsController],
        providers: [payment_repository_1.PaymentRepository, payments_service_1.PaymentsService, payment_reconciliation_service_1.PaymentReconciliationService],
        exports: [payment_repository_1.PaymentRepository, payments_service_1.PaymentsService, payment_reconciliation_service_1.PaymentReconciliationService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map