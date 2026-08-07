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
 * Is the money actually in?
 *
 * `no_payment_required` counts: a fully discounted session is legitimately paid
 * for at zero, and refusing to confirm it would leave a booking hanging on a
 * payment that will never arrive because none is owed.
 */
function isSessionPaid(session: Stripe.Checkout.Session): boolean {
  return (
    session.payment_status === 'paid' ||
    session.payment_status === 'no_payment_required'
  );
}

/**
 * Stripe → POST /api/v1/webhooks/stripe
 *
 * Subscribe to ALL FOUR:
 *   checkout.session.completed               — the ordinary success
 *   checkout.session.async_payment_succeeded — delayed methods settling later
 *   checkout.session.async_payment_failed    — delayed methods failing later
 *   checkout.session.expired                 — nobody came back
 *
 * Do NOT subscribe payment_intent.* instead. Those fire for the same payments
 * but carry none of the session metadata that links a payment to its prospect
 * and booking, so the handler would have nothing to attach the money to.
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

  /**
   * Hands a paid session to the confirmation path.
   *
   * Extracted because two events reach it — the immediate `completed` and the
   * delayed `async_payment_succeeded` — and a copy of this mapping in each is a
   * copy that will drift.
   */
  private confirm(session: Stripe.Checkout.Session): Promise<void> {
    return this.webhooksService.handleStripeCheckoutCompleted({
      id: session.id,
      payment_intent:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });
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
      this.logger.warn(`Rejected Stripe webhook: ${(error as Error).message}`);
      throw new UnauthorizedException();
    }

    try {
      const handled = await this.webhooksService.processOnce(
        'stripe',
        event.id,
        event.type,
        event,
        async () => {
          switch (event.type) {
            // The ordinary success. Card payments land here already paid.
            case 'checkout.session.completed': {
              const session = event.data.object;

              // A completed session is not always a paid one. Delayed payment
              // methods complete as `unpaid` and settle minutes to days later
              // via async_payment_succeeded below, so confirming here on the
              // strength of "completed" alone would give away the consult.
              if (!isSessionPaid(session)) {
                this.logger.log(
                  `Session ${session.id} completed with payment_status=` +
                    `${session.payment_status} — waiting for the payment to ` +
                    `settle before confirming.`,
                );
                return;
              }

              await this.confirm(session);
              break;
            }

            // The delayed success. Same outcome, arriving later — and without
            // this case those payments were taken and never confirmed.
            case 'checkout.session.async_payment_succeeded': {
              const session = event.data.object;
              this.logger.log(
                `Session ${session.id} settled asynchronously — confirming now.`,
              );
              await this.confirm(session);
              break;
            }

            // The delayed failure. The visitor believed they had paid, so this
            // is a real outcome rather than an abandonment, and the payment row
            // should say so instead of sitting open until the sweep expires it.
            case 'checkout.session.async_payment_failed': {
              const session = event.data.object;
              this.logger.warn(
                `Session ${session.id} failed to settle. The visitor completed ` +
                  `checkout believing they had paid — their booking is still ` +
                  `unpaid and needs a follow-up.`,
              );
              await this.webhooksService.handleStripeSessionUnpaid(
                session.id,
                'failed',
              );
              break;
            }

            // Nobody came back. Closing the row keeps it out of the reuse
            // lookup and out of the reconciliation sweep.
            case 'checkout.session.expired': {
              const session = event.data.object;
              await this.webhooksService.handleStripeSessionUnpaid(
                session.id,
                'expired',
              );
              break;
            }

            default:
              // WARN, not log. An event we do not handle is almost always a
              // subscription mistake in the Stripe dashboard, and this line is
              // the only place it becomes visible — the symptom otherwise is a
              // payment that silently never confirms. `payment_intent.succeeded`
              // in particular looks like the right event and is not: it does not
              // carry the session metadata that links a payment to its booking.
              this.logger.warn(
                `Received "${event.type}", which this endpoint does not handle. ` +
                  `Consultations are confirmed by checkout.session.completed ` +
                  `(and .async_payment_succeeded). If you expected this event to ` +
                  `do something, check the events selected on the webhook endpoint.`,
              );
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
