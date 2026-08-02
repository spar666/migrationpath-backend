import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentRepository } from './payment.repository';
import { Payment } from './entities/payment.entity';
import { CreateConsultationCheckoutDto } from './dto/create-checkout.dto';
import { ProspectService } from '../prospect/prospect.service';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';

/**
 * Owns the Stripe relationship.
 *
 * Two rules this file holds to:
 *
 *  1. The client never names a price. The amount comes from a Price object
 *     configured in Stripe and referenced by env — the request only says WHO
 *     is paying, never HOW MUCH.
 *
 *  2. Nothing is marked paid here. This service creates a session and returns
 *     a URL; the transition to `paid` happens only in the webhook, from a
 *     signature-verified Stripe event. A success redirect is a browser
 *     navigation and a browser navigation is not proof of payment — anyone can
 *     open the success URL directly.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentRepository: PaymentRepository,
    private readonly prospectService: ProspectService,
    private readonly bookingRepository: ConsultationBookingRepository,
  ) {
    const secretKey = this.configService.get<string>(
      'integrations.stripe.secretKey',
    );

    if (!secretKey) {
      // Not fatal at boot — the rest of the API must still run in local dev
      // and in environments that do not take payments. Requests to the
      // checkout endpoint fail loudly instead.
      this.logger.warn(
        'STRIPE_SECRET_KEY is not set — consultation checkout is disabled.',
      );
      this.stripe = null;
    } else {
      // apiVersion deliberately not pinned here: the installed SDK pins its
      // own tested version. Pin it explicitly only when you have a reason to,
      // and then verify the webhook payload shape still matches.
      this.stripe = new Stripe(secretKey);
    }
  }

  /**
   * Creates a hosted Stripe Checkout session for the consultation fee.
   * Returns the URL the browser should be sent to.
   */
  async createConsultationCheckout(
    dto: CreateConsultationCheckoutDto,
  ): Promise<{ checkout_url: string; payment_id: string }> {
    const stripe = this.requireStripe();

    const priceId = this.configService.get<string>(
      'integrations.stripe.consultPriceId',
    );
    if (!priceId) {
      throw new ServiceUnavailableException(
        'The consultation fee has not been configured yet.',
      );
    }

    // Throws 404 if the prospect does not exist — which also stops this
    // endpoint being used to probe for valid prospect ids with a real charge.
    const prospect = await this.prospectService.findById(dto.prospect_id);

    if (await this.paymentRepository.hasPaidFor(prospect.id, 'consultation')) {
      // Charging twice for the same consult is worse than a slightly awkward
      // error, and it is a refund conversation either way.
      throw new BadRequestException(
        'This consultation has already been paid for.',
      );
    }

    const booking = dto.booking_id
      ? await this.bookingRepository.findById(dto.booking_id)
      : await this.bookingRepository.findLatestForProspect(prospect.id);

    if (!booking) {
      // Book-then-pay: there should always be a pending booking by the time
      // someone reaches checkout. If there isn't, the funnel was skipped.
      throw new BadRequestException(
        'Choose a consultation time before paying to confirm it.',
      );
    }

    const successUrl = this.configService.get<string>(
      'integrations.stripe.successUrl',
    );
    const cancelUrl = this.configService.get<string>(
      'integrations.stripe.cancelUrl',
    );
    if (!successUrl || !cancelUrl) {
      throw new ServiceUnavailableException(
        'Payment return URLs are not configured.',
      );
    }

    // Write the local row FIRST, in `created`. If Stripe succeeds and our
    // response is lost in flight, the webhook still has a row to reconcile
    // against rather than arriving for a payment we have no record of.
    const payment = await this.paymentRepository.create({
      prospect_id: prospect.id,
      booking_id: booking.id,
      purpose: 'consultation',
      status: 'created',
      provider: 'stripe',
      currency: 'aud',
    });

    try {
      const session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          line_items: [{ price: priceId, quantity: 1 }],
          customer_email: prospect.email,
          // client_reference_id and metadata are how the webhook gets back to
          // our records. Both are set: metadata is richer, client_reference_id
          // is what shows in the Stripe dashboard search box, which is what an
          // agent will actually use when reconciling by hand.
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
        },
        {
          // Idempotency key: a double-clicked pay button creates one session,
          // not two. Scoped to the payment row so a genuine retry after a
          // failure still gets a fresh session.
          idempotencyKey: `consult-${payment.id}`,
        },
      );

      if (!session.url) {
        throw new Error('Stripe returned a session without a URL');
      }

      await this.paymentRepository.update(payment.id, {
        provider_session_id: session.id,
        amount_cents: session.amount_total ?? null,
        currency: session.currency ?? 'aud',
      });

      return { checkout_url: session.url, payment_id: payment.id };
    } catch (error) {
      await this.paymentRepository.update(payment.id, { status: 'failed' });
      this.logger.error(
        `Failed to create Stripe checkout session for prospect ${prospect.human_ref}: ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'We could not start the payment. Please try again shortly.',
      );
    }
  }

  /**
   * Marks a payment paid. Called ONLY from the verified Stripe webhook.
   *
   * Returns null when the session has already been recorded as paid, so the
   * caller can skip the side effects (booking flip, agent alert) on a replay.
   */
  async markPaidFromSession(session: {
    id: string;
    payment_intent?: string | null;
    amount_total?: number | null;
    currency?: string | null;
    metadata?: Record<string, string> | null;
  }): Promise<Payment | null> {
    const existing = await this.paymentRepository.findBySessionId(session.id);

    if (existing?.status === 'paid') {
      this.logger.log(
        `Stripe session ${session.id} already recorded as paid — ignoring replay`,
      );
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

    // No local row: the session was created outside this service, or our row
    // was lost. Stripe says it was paid, so record it rather than drop it —
    // an orphan payment row is recoverable, a silently ignored payment is not.
    const prospectId = session.metadata?.prospect_id;
    if (!prospectId) {
      this.logger.error(
        `Stripe session ${session.id} completed with no local payment row and ` +
          `no prospect_id in metadata — manual reconciliation required`,
      );
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

  findForProspect(prospectId: string): Promise<Payment[]> {
    return this.paymentRepository.findByProspectId(prospectId);
  }

  private requireStripe(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Payments are not configured on this environment.',
      );
    }
    return this.stripe;
  }
}
