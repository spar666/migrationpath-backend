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
var PaymentReconciliationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentReconciliationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const payment_repository_1 = require("./payment.repository");
const payments_service_1 = require("./payments.service");
let PaymentReconciliationService = PaymentReconciliationService_1 = class PaymentReconciliationService {
    configService;
    paymentRepository;
    paymentsService;
    logger = new common_1.Logger(PaymentReconciliationService_1.name);
    timer;
    running = false;
    constructor(configService, paymentRepository, paymentsService) {
        this.configService = configService;
        this.paymentRepository = paymentRepository;
        this.paymentsService = paymentsService;
    }
    onModuleInit() {
        const enabled = this.configService.get('PAYMENT_RECONCILIATION_ENABLED') ===
            'true';
        if (!enabled) {
            this.logger.log('Payment reconciliation sweep is off. Set ' +
                'PAYMENT_RECONCILIATION_ENABLED=true on ONE instance to turn it on.');
            return;
        }
        this.timer = setInterval(() => {
            void this.reconcile().catch((error) => {
                this.logger.error(`Reconciliation sweep failed: ${error.message}`);
            });
        }, SWEEP_INTERVAL_MS);
        this.timer.unref?.();
        this.logger.log('Payment reconciliation sweep is on (hourly).');
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
    }
    async reconcile() {
        if (this.running) {
            this.logger.log('Reconciliation already in progress — skipping this tick');
            return { checked: 0, recovered: 0, expired: 0 };
        }
        this.running = true;
        try {
            const stale = await this.paymentRepository.findStaleOpenSessions(payments_service_1.STALE_SESSION_MS);
            let recovered = 0;
            let expired = 0;
            for (const payment of stale) {
                if (!payment.provider_session_id)
                    continue;
                try {
                    const outcome = await this.paymentsService.reconcileSession(payment.id, payment.provider_session_id);
                    if (outcome === 'recovered')
                        recovered += 1;
                    if (outcome === 'expired')
                        expired += 1;
                }
                catch (error) {
                    this.logger.error(`Could not reconcile payment ${payment.id}: ${error.message}`);
                }
            }
            if (recovered > 0) {
                this.logger.warn(`Reconciliation recovered ${recovered} paid payment(s) the webhook ` +
                    `never delivered. Check the Stripe webhook endpoint is healthy.`);
            }
            if (stale.length > 0) {
                this.logger.log(`Reconciliation: checked ${stale.length}, recovered ${recovered}, ` +
                    `expired ${expired}`);
            }
            return { checked: stale.length, recovered, expired };
        }
        finally {
            this.running = false;
        }
    }
};
exports.PaymentReconciliationService = PaymentReconciliationService;
exports.PaymentReconciliationService = PaymentReconciliationService = PaymentReconciliationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        payment_repository_1.PaymentRepository,
        payments_service_1.PaymentsService])
], PaymentReconciliationService);
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;
//# sourceMappingURL=payment-reconciliation.service.js.map