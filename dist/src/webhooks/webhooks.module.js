"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const webhook_event_entity_1 = require("./entities/webhook-event.entity");
const webhook_event_repository_1 = require("./webhook-event.repository");
const webhooks_service_1 = require("./webhooks.service");
const calendly_webhook_controller_1 = require("./calendly-webhook.controller");
const stripe_webhook_controller_1 = require("./stripe-webhook.controller");
const prospect_module_1 = require("../prospect/prospect.module");
const payments_module_1 = require("../payments/payments.module");
const consultation_module_1 = require("../consultation/consultation.module");
let WebhooksModule = class WebhooksModule {
};
exports.WebhooksModule = WebhooksModule;
exports.WebhooksModule = WebhooksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([webhook_event_entity_1.WebhookEvent]),
            prospect_module_1.ProspectModule,
            payments_module_1.PaymentsModule,
            consultation_module_1.ConsultationModule,
        ],
        controllers: [calendly_webhook_controller_1.CalendlyWebhookController, stripe_webhook_controller_1.StripeWebhookController],
        providers: [webhook_event_repository_1.WebhookEventRepository, webhooks_service_1.WebhooksService],
        exports: [webhooks_service_1.WebhooksService],
    })
], WebhooksModule);
//# sourceMappingURL=webhooks.module.js.map