import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiExcludeController } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import Stripe from 'stripe';
import { WebhooksService } from './webhooks.service';

/**
 * Stripe → POST /api/v1/webhooks/stripe
 * Subscribe to: checkout.session.completed
 *
 * This endpoint is the only thing in the system that can turn a pending
 * booking into a confirmed one. The success redirect cannot: it is a browser
 * navigation to a URL anyone can type.
 *
 * Excluded from Swagger and from throttling for the same reasons as the
 * Calendly controller.
 */
@ApiExcludeController()
@SkipThrottle()
@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private readonly stripe: Stripe | null;

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>(
      'integrations.stripe.secretKey',
    );
    this.stripe = secretKey ? new Stripe(secretKey) : null;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handle(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    const webhookSecret = this.configService.get<string>(
      'integrations.stripe.webhookSecret',
    );

    if (!this.stripe || !webhookSecret) {
      this.logger.error(
        'STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET not set — rejecting webhook.',
      );
      throw new UnauthorizedException();
    }

    // Requires `rawBody: true` in main.ts — constructEvent verifies over the
    // exact bytes and will reject a re-serialised body.
    const rawBody = request.rawBody;
    if (!rawBody) {
      this.logger.error(
        'Raw body unavailable — is NestFactory.create called with { rawBody: true }?',
      );
      throw new BadRequestException('Raw body required');
    }

    let event: Stripe.Event;
    try {
      // Handles the signature, the timestamp tolerance and the replay window.
      // Do not hand-roll this.
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature ?? '',
        webhookSecret,
      );
    } catch (error) {
      this.logger.warn(
        `Rejected Stripe webhook: ${(error as Error).message}`,
      );
      throw new UnauthorizedException();
    }

    try {
      const handled = await this.webhooksService.processOnce(
        'stripe',
        event.id,
        event.type,
        event as unknown as Record<string, any>,
        async () => {
          switch (event.type) {
            case 'checkout.session.completed': {
              const session = event.data.object as Stripe.Checkout.Session;

              // A completed session is not always a paid one — with delayed
              // payment methods it can complete as `unpaid` and settle later.
              // Confirming a booking on an unpaid session would give away the
              // consult.
              if (
                session.payment_status !== 'paid' &&
                session.payment_status !== 'no_payment_required'
              ) {
                this.logger.log(
                  `Session ${session.id} completed with payment_status=` +
                    `${session.payment_status} — not confirming yet.`,
                );
                return;
              }

              await this.webhooksService.handleStripeCheckoutCompleted({
                id: session.id,
                payment_intent:
                  typeof session.payment_intent === 'string'
                    ? session.payment_intent
                    : (session.payment_intent?.id ?? null),
                amount_total: session.amount_total,
                currency: session.currency,
                metadata: session.metadata,
              });
              break;
            }
            default:
              this.logger.log(`Ignoring unhandled Stripe event: ${event.type}`);
          }
        },
      );

      return { received: true, handled };
    } catch (error) {
      // 500 on purpose: Stripe retries non-2xx responses with backoff for
      // days. If confirming the booking failed, we WANT that retry — swallow
      // it with a 200 and the prospect has paid for a consult nobody knows
      // about. The idempotency table makes the retry safe.
      this.logger.error(
        `Stripe webhook ${event.id} (${event.type}) failed: ${(error as Error).message}`,
      );
      throw new InternalServerErrorException('Webhook handling failed');
    }
  }
}
