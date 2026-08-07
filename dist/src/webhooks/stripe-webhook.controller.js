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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const stripe_1 = __importDefault(require("stripe"));
const webhooks_service_1 = require("./webhooks.service");
function isSessionPaid(session) {
    return (session.payment_status === 'paid' ||
        session.payment_status === 'no_payment_required');
}
let StripeWebhookController = StripeWebhookController_1 = class StripeWebhookController {
    webhooksService;
    configService;
    logger = new common_1.Logger(StripeWebhookController_1.name);
    stripe;
    constructor(webhooksService, configService) {
        this.webhooksService = webhooksService;
        this.configService = configService;
        const secretKey = this.configService.get('integrations.stripe.secretKey');
        this.stripe = secretKey ? new stripe_1.default(secretKey) : null;
    }
    confirm(session) {
        return this.webhooksService.handleStripeCheckoutCompleted({
            id: session.id,
            payment_intent: typeof session.payment_intent === 'string'
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
            amount_total: session.amount_total,
            currency: session.currency,
            metadata: session.metadata,
        });
    }
    async handle(request, signature) {
        const webhookSecret = this.configService.get('integrations.stripe.webhookSecret');
        if (!this.stripe || !webhookSecret) {
            this.logger.error('STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET not set — rejecting webhook.');
            throw new common_1.UnauthorizedException();
        }
        const rawBody = request.rawBody;
        if (!rawBody) {
            this.logger.error('Raw body unavailable — is NestFactory.create called with { rawBody: true }?');
            throw new common_1.BadRequestException('Raw body required');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature ?? '', webhookSecret);
        }
        catch (error) {
            this.logger.warn(`Rejected Stripe webhook: ${error.message}`);
            throw new common_1.UnauthorizedException();
        }
        try {
            const handled = await this.webhooksService.processOnce('stripe', event.id, event.type, event, async () => {
                switch (event.type) {
                    case 'checkout.session.completed': {
                        const session = event.data.object;
                        if (!isSessionPaid(session)) {
                            this.logger.log(`Session ${session.id} completed with payment_status=` +
                                `${session.payment_status} — waiting for the payment to ` +
                                `settle before confirming.`);
                            return;
                        }
                        await this.confirm(session);
                        break;
                    }
                    case 'checkout.session.async_payment_succeeded': {
                        const session = event.data.object;
                        this.logger.log(`Session ${session.id} settled asynchronously — confirming now.`);
                        await this.confirm(session);
                        break;
                    }
                    case 'checkout.session.async_payment_failed': {
                        const session = event.data.object;
                        this.logger.warn(`Session ${session.id} failed to settle. The visitor completed ` +
                            `checkout believing they had paid — their booking is still ` +
                            `unpaid and needs a follow-up.`);
                        await this.webhooksService.handleStripeSessionUnpaid(session.id, 'failed');
                        break;
                    }
                    case 'checkout.session.expired': {
                        const session = event.data.object;
                        await this.webhooksService.handleStripeSessionUnpaid(session.id, 'expired');
                        break;
                    }
                    default:
                        this.logger.warn(`Received "${event.type}", which this endpoint does not handle. ` +
                            `Consultations are confirmed by checkout.session.completed ` +
                            `(and .async_payment_succeeded). If you expected this event to ` +
                            `do something, check the events selected on the webhook endpoint.`);
                }
            });
            return { received: true, handled };
        }
        catch (error) {
            this.logger.error(`Stripe webhook ${event.id} (${event.type}) failed: ${error.message}`);
            throw new common_1.InternalServerErrorException('Webhook handling failed');
        }
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handle", null);
exports.StripeWebhookController = StripeWebhookController = StripeWebhookController_1 = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Controller)('webhooks/stripe'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService,
        config_1.ConfigService])
], StripeWebhookController);
//# sourceMappingURL=stripe-webhook.controller.js.map