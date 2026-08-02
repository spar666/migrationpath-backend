import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEvent } from './entities/webhook-event.entity';
import { WebhookEventRepository } from './webhook-event.repository';
import { WebhooksService } from './webhooks.service';
import { CalendlyWebhookController } from './calendly-webhook.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { ProspectModule } from '../prospect/prospect.module';
import { PaymentsModule } from '../payments/payments.module';
import { ConsultationModule } from '../consultation/consultation.module';

/**
 * Inbound integrations: Calendly (scheduling) and Stripe (payment).
 *
 * Both controllers require `rawBody: true` on the Nest application — see
 * main.ts. Without it every webhook fails signature verification.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEvent]),
    ProspectModule,
    PaymentsModule,
    ConsultationModule,
  ],
  controllers: [CalendlyWebhookController, StripeWebhookController],
  providers: [WebhookEventRepository, WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
