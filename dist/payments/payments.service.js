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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const payment_repository_1 = require("./payment.repository");
const prospect_service_1 = require("../prospect/prospect.service");
const consultation_repository_1 = require("../consultation/consultation.repository");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    configService;
    paymentRepository;
    prospectService;
    bookingRepository;
    logger = new common_1.Logger(PaymentsService_1.name);
    stripe;
    constructor(configService, paymentRepository, prospectService, bookingRepository) {
        this.configService = configService;
        this.paymentRepository = paymentRepository;
        this.prospectService = prospectService;
        this.bookingRepository = bookingRepository;
        const secretKey = this.configService.get('integrations.stripe.secretKey');
        if (!secretKey) {
            this.logger.warn('STRIPE_SECRET_KEY is not set — consultation checkout is disabled.');
            this.stripe = null;
        }
        else {
            this.stripe = new stripe_1.default(secretKey);
        }
    }
    async createConsultationCheckout(dto) {
        const stripe = this.requireStripe();
        const priceId = this.configService.get('integrations.stripe.consultPriceId');
        if (!priceId) {
            throw new common_1.ServiceUnavailableException('The consultation fee has not been configured yet.');
        }
        const prospect = await this.prospectService.findById(dto.prospect_id);
        if (await this.paymentRepository.hasPaidFor(prospect.id, 'consultation')) {
            throw new common_1.BadRequestException('This consultation has already been paid for.');
        }
        const booking = dto.booking_id
            ? await this.bookingRepository.findById(dto.booking_id)
            : await this.bookingRepository.findLatestForProspect(prospect.id);
        if (!booking) {
            throw new common_1.BadRequestException('Choose a consultation time before paying to confirm it.');
        }
        const successUrl = this.configService.get('integrations.stripe.successUrl');
        const cancelUrl = this.configService.get('integrations.stripe.cancelUrl');
        if (!successUrl || !cancelUrl) {
            throw new common_1.ServiceUnavailableException('Payment return URLs are not configured.');
        }
        const payment = await this.paymentRepository.create({
            prospect_id: prospect.id,
            booking_id: booking.id,
            purpose: 'consultation',
            status: 'created',
            provider: 'stripe',
            currency: 'aud',
        });
        try {
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                line_items: [{ price: priceId, quantity: 1 }],
                customer_email: prospect.email,
                client_reference_id: prospect.human_ref,
                metadata: {
                    prospect_id: prospect.id,
                    human_ref: prospect.human_ref,
                    booking_id: booking.id,
                    payment_id: payment.id,
                    purpose: 'consultation',
                },
                success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}ref=${prospect.human_ref}`,
                cancel_url: cancelUrl,
            }, {
                idempotencyKey: `consult-${payment.id}`,
            });
            if (!session.url) {
                throw new Error('Stripe returned a session without a URL');
            }
            await this.paymentRepository.update(payment.id, {
                provider_session_id: session.id,
                amount_cents: session.amount_total ?? null,
                currency: session.currency ?? 'aud',
            });
            return { checkout_url: session.url, payment_id: payment.id };
        }
        catch (error) {
            await this.paymentRepository.update(payment.id, { status: 'failed' });
            this.logger.error(`Failed to create Stripe checkout session for prospect ${prospect.human_ref}: ${error.message}`);
            throw new common_1.ServiceUnavailableException('We could not start the payment. Please try again shortly.');
        }
    }
    async markPaidFromSession(session) {
        const existing = await this.paymentRepository.findBySessionId(session.id);
        if (existing?.status === 'paid') {
            this.logger.log(`Stripe session ${session.id} already recorded as paid — ignoring replay`);
            return null;
        }
        if (existing) {
            return this.paymentRepository.update(existing.id, {
                status: 'paid',
                provider_payment_intent_id: session.payment_intent ?? null,
                amount_cents: session.amount_total ?? existing.amount_cents ?? null,
                currency: session.currency ?? existing.currency,
                paid_at: new Date(),
                provider_metadata: session.metadata ?? undefined,
            });
        }
        const prospectId = session.metadata?.prospect_id;
        if (!prospectId) {
            this.logger.error(`Stripe session ${session.id} completed with no local payment row and ` +
                `no prospect_id in metadata — manual reconciliation required`);
            return null;
        }
        return this.paymentRepository.create({
            prospect_id: prospectId,
            booking_id: session.metadata?.booking_id ?? null,
            purpose: 'consultation',
            status: 'paid',
            provider: 'stripe',
            provider_session_id: session.id,
            provider_payment_intent_id: session.payment_intent ?? null,
            amount_cents: session.amount_total ?? null,
            currency: session.currency ?? 'aud',
            paid_at: new Date(),
            provider_metadata: session.metadata ?? undefined,
        });
    }
    findForProspect(prospectId) {
        return this.paymentRepository.findByProspectId(prospectId);
    }
    requireStripe() {
        if (!this.stripe) {
            throw new common_1.ServiceUnavailableException('Payments are not configured on this environment.');
        }
        return this.stripe;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        payment_repository_1.PaymentRepository,
        prospect_service_1.ProspectService,
        consultation_repository_1.ConsultationBookingRepository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map