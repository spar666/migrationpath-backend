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
exports.PaymentsService = exports.STALE_SESSION_MS = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const payment_repository_1 = require("./payment.repository");
const prospect_service_1 = require("../prospect/prospect.service");
const consultation_repository_1 = require("../consultation/consultation.repository");
function explainBadPriceId(value) {
    if (value.startsWith('prod_')) {
        return (`That is the PRODUCT id — the Price id sits next to it on the same page. ` +
            `Run \`stripe prices list --product=${value}\` and use the "price_..." id ` +
            `it returns, or create one with ` +
            `\`stripe prices create --product=${value} --unit-amount=<cents> --currency=aud\`.`);
    }
    if (/^[\d.,]+$/.test(value.trim())) {
        return (`That is an amount. The fee lives in Stripe as a Price object so the ` +
            `client can never name a price — if it could, a consult could be bought ` +
            `for a cent. Create a Product and Price in Stripe and use the id.`);
    }
    return (`It must look like "price_1AbC...". Create a Product and Price in the ` +
        `Stripe dashboard (or with \`stripe prices create\`) and use the id it returns.`);
}
function isDefiniteStripeRejection(error) {
    const type = error?.type;
    if (typeof type !== 'string')
        return false;
    return (type === 'StripeInvalidRequestError' ||
        type === 'StripeAuthenticationError' ||
        type === 'StripePermissionError' ||
        type === 'StripeCardError' ||
        type === 'StripeRateLimitError');
}
const SESSION_REUSE_MS = 20 * 60 * 60 * 1000;
exports.STALE_SESSION_MS = 26 * 60 * 60 * 1000;
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
        const priceId = this.configService.get('integrations.stripe.consultPriceId');
        if (priceId && !priceId.startsWith('price_')) {
            this.logger.error(`STRIPE_CONSULT_PRICE_ID is "${priceId}" — that is not a Stripe Price ` +
                `id, so consultation checkout WILL fail. ${explainBadPriceId(priceId)}`);
        }
        else if (!priceId) {
            this.logger.warn('STRIPE_CONSULT_PRICE_ID is not set — consultation checkout is disabled.');
        }
    }
    async createConsultationCheckout(dto) {
        const stripe = this.requireStripe();
        const priceId = this.configService.get('integrations.stripe.consultPriceId');
        if (!priceId) {
            throw new common_1.ServiceUnavailableException('The consultation fee has not been configured yet.');
        }
        if (!priceId.startsWith('price_')) {
            this.logger.error(`STRIPE_CONSULT_PRICE_ID is "${priceId}", which is not a Stripe Price ` +
                `id. ${explainBadPriceId(priceId)}`);
            throw new common_1.ServiceUnavailableException('The consultation fee is not set up correctly. Please contact us and ' +
                'quote your reference — we will take payment another way.');
        }
        const prospect = await this.prospectService.findById(dto.prospect_id);
        if (await this.paymentRepository.hasPaidFor(prospect.id, 'consultation')) {
            throw new common_1.BadRequestException('This consultation has already been paid for.');
        }
        const booking = dto.booking_id
            ? await this.bookingRepository.findById(dto.booking_id)
            : await this.bookingRepository.findLatestForProspect(prospect.id);
        if (!booking) {
            this.logger.warn(`Checkout attempted for prospect ${prospect.human_ref} with no booking. ` +
                `Usually the Calendly invitee webhook has not landed yet; if this is ` +
                `frequent, check the webhook subscription is live.`);
            throw new common_1.BadRequestException('We are still registering the time you picked. Give it a few seconds ' +
                'and try again — if it keeps happening, contact us with your reference.');
        }
        const successUrl = this.configService.get('integrations.stripe.successUrl');
        const cancelUrl = this.configService.get('integrations.stripe.cancelUrl');
        if (!successUrl || !cancelUrl) {
            throw new common_1.ServiceUnavailableException('Payment return URLs are not configured.');
        }
        const open = await this.paymentRepository.findOpenSessionForBooking(booking.id, SESSION_REUSE_MS);
        if (open?.provider_session_id) {
            const reusable = await this.retrieveReusableSession(stripe, open.provider_session_id);
            if (reusable) {
                this.logger.log(`Reusing open checkout session ${open.provider_session_id} for ` +
                    `prospect ${prospect.human_ref}`);
                return { checkout_url: reusable, payment_id: open.id };
            }
            await this.paymentRepository.update(open.id, { status: 'expired' });
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
            await this.paymentRepository.update(payment.id, {
                provider_session_id: session.id,
                amount_cents: session.amount_total ?? null,
                currency: session.currency ?? 'aud',
            });
            if (!session.url) {
                throw new Error(`Stripe returned session ${session.id} without a URL — recorded so ` +
                    `reconciliation can resolve it.`);
            }
            return { checkout_url: session.url, payment_id: payment.id };
        }
        catch (error) {
            if (isDefiniteStripeRejection(error)) {
                await this.paymentRepository.update(payment.id, { status: 'failed' });
            }
            else {
                this.logger.warn(`Checkout for ${prospect.human_ref} failed without a definite answer ` +
                    `from Stripe. Leaving payment ${payment.id} open so reconciliation ` +
                    `can check whether a session was created.`);
            }
            this.logger.error(`Failed to create Stripe checkout session for prospect ${prospect.human_ref}: ${error.message}`);
            throw new common_1.ServiceUnavailableException('We could not start the payment. Please try again shortly.');
        }
    }
    async markPaidFromSession(session) {
        const existing = (await this.paymentRepository.findBySessionId(session.id)) ??
            (await this.findByMetadataPaymentId(session.metadata?.payment_id));
        if (existing?.status === 'paid') {
            this.logger.log(`Stripe session ${session.id} is already paid — re-running the ` +
                `confirmation so anything left unfinished last time completes.`);
            return existing;
        }
        if (existing) {
            return this.paymentRepository.markPaidWithBooking(existing.id, existing.booking_id ?? null, {
                status: 'paid',
                provider_session_id: session.id,
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
    async markSessionUnpaid(sessionId, outcome) {
        const existing = await this.paymentRepository.findBySessionId(sessionId);
        if (!existing)
            return null;
        if (existing.status === 'paid') {
            this.logger.warn(`Ignoring "${outcome}" for session ${sessionId}: the payment is ` +
                `already recorded as paid. Events arrived out of order.`);
            return existing;
        }
        return this.paymentRepository.update(existing.id, { status: outcome });
    }
    async reconcileSession(paymentId, sessionId) {
        const stripe = this.requireStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const isPaid = session.payment_status === 'paid' ||
            session.payment_status === 'no_payment_required';
        if (isPaid) {
            this.logger.warn(`Session ${sessionId} is paid at Stripe but our payment ${paymentId} ` +
                `was still open — the webhook never arrived. Confirming it now.`);
            await this.confirmFromReconciliation?.({
                id: session.id,
                payment_intent: typeof session.payment_intent === 'string'
                    ? session.payment_intent
                    : (session.payment_intent?.id ?? null),
                amount_total: session.amount_total,
                currency: session.currency,
                metadata: session.metadata,
            });
            return 'recovered';
        }
        if (session.status === 'open')
            return 'open';
        await this.paymentRepository.update(paymentId, { status: 'expired' });
        return 'expired';
    }
    confirmFromReconciliation;
    setReconciliationConfirmer(confirm) {
        this.confirmFromReconciliation = confirm;
    }
    async findByMetadataPaymentId(paymentId) {
        if (!paymentId)
            return null;
        try {
            return await this.paymentRepository.findById(paymentId);
        }
        catch {
            this.logger.warn(`Stripe session names payment ${paymentId}, which does not exist here.`);
            return null;
        }
    }
    findForProspect(prospectId) {
        return this.paymentRepository.findByProspectId(prospectId);
    }
    async retrieveReusableSession(stripe, sessionId) {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.status !== 'open' || !session.url)
                return null;
            return session.url;
        }
        catch (error) {
            this.logger.warn(`Could not check existing session ${sessionId}, creating a new one: ` +
                `${error.message}`);
            return null;
        }
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