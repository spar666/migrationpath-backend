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
var CalendlyWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendlyWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const webhooks_service_1 = require("./webhooks.service");
let CalendlyWebhookController = CalendlyWebhookController_1 = class CalendlyWebhookController {
    webhooksService;
    configService;
    logger = new common_1.Logger(CalendlyWebhookController_1.name);
    constructor(webhooksService, configService) {
        this.webhooksService = webhooksService;
        this.configService = configService;
    }
    async handle(request, signature) {
        const signingKey = this.configService.get('integrations.calendly.signingKey');
        if (!signingKey) {
            this.logger.error('CALENDLY_WEBHOOK_SIGNING_KEY is not set — rejecting webhook.');
            throw new common_1.UnauthorizedException();
        }
        const rawBody = request.rawBody;
        if (!rawBody) {
            this.logger.error('Raw body unavailable — is NestFactory.create called with { rawBody: true }?');
            throw new common_1.BadRequestException('Raw body required');
        }
        if (!this.webhooksService.verifyCalendlySignature(rawBody, signature, signingKey)) {
            this.logger.warn('Rejected Calendly webhook: invalid signature');
            throw new common_1.UnauthorizedException();
        }
        const payload = JSON.parse(rawBody.toString('utf8'));
        const eventType = payload?.event ?? 'unknown';
        const invitee = this.webhooksService.mapCalendlyInvitee(payload);
        if (!invitee) {
            this.logger.error(`Calendly ${eventType} payload could not be mapped to an invitee`);
            return { received: true, handled: false };
        }
        const externalId = `${invitee.inviteeUri}#${eventType}`;
        const handled = await this.webhooksService.processOnce('calendly', externalId, eventType, payload, async () => {
            switch (eventType) {
                case 'invitee.created':
                    await this.webhooksService.handleCalendlyInviteeCreated(invitee);
                    break;
                case 'invitee.canceled':
                    await this.webhooksService.handleCalendlyInviteeCanceled(invitee);
                    break;
                default:
                    this.logger.log(`Ignoring unhandled Calendly event: ${eventType}`);
            }
        });
        return { received: true, handled };
    }
};
exports.CalendlyWebhookController = CalendlyWebhookController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('calendly-webhook-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendlyWebhookController.prototype, "handle", null);
exports.CalendlyWebhookController = CalendlyWebhookController = CalendlyWebhookController_1 = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Controller)('webhooks/calendly'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService,
        config_1.ConfigService])
], CalendlyWebhookController);
//# sourceMappingURL=calendly-webhook.controller.js.map