import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { WebhookEventRepository } from './webhook-event.repository';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { ProspectNotifierService } from '../prospect/prospect-notifier.service';
import { PaymentsService } from '../payments/payments.service';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';

/**
 * The shape we need out of a Calendly invitee webhook, mapped from its
 * payload so the rest of this file does not care about Calendly's nesting.
 */
export interface CalendlyInvitee {
  /** Invitee URI — our idempotency key and the booking's scheduler_event_id. */
  inviteeUri: string;
  scheduledEventUri?: string;
  email?: string;
  name?: string;
  startsAt?: string;
  endsAt?: string;
  joinUrl?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
  cancellationReason?: string;
  /** From the ?prospect_id= UTM/query param the frontend appends. */
  prospectId?: string;
}

/**
 * Handles the two hosted integrations that talk back to us.
 *
 * ⚠️ §6: the payload shapes and signing schemes below were written to the
 * providers' documented behaviour. Confirm both against current provider docs
 * and your plan tier before go-live — Calendly's webhook signing in particular
 * is only available on some plans, and the payload nesting has changed between
 * API versions.
 */
@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly webhookEventRepository: WebhookEventRepository,
    private readonly prospectService: ProspectService,
    private readonly summaryService: ProspectSummaryService,
    private readonly notifier: ProspectNotifierService,
    private readonly paymentsService: PaymentsService,
    private readonly bookingRepository: ConsultationBookingRepository,
  ) {}

  // ==========================================================================
  // Calendly
  // ==========================================================================

  /**
   * Verifies Calendly's `Calendly-Webhook-Signature` header.
   *
   * Format: `t=<unix seconds>,v1=<hex hmac>`; the signed payload is
   * `<t>.<raw body>` using HMAC-SHA256 with the subscription's signing key.
   *
   * ⚠️ Verify this against current Calendly docs before go-live.
   */
  verifyCalendlySignature(
    rawBody: Buffer,
    signatureHeader: string | undefined,
    signingKey: string,
    toleranceSeconds = 300,
  ): boolean {
    if (!signatureHeader) return false;

    const parts = Object.fromEntries(
      signatureHeader
        .split(',')
        .map((part) => part.trim().split('=', 2))
        .filter((pair): pair is [string, string] => pair.length === 2),
    );

    const timestamp = parts['t'];
    const provided = parts['v1'];
    if (!timestamp || !provided) return false;

    // Reject stale signatures: without this, a captured request stays
    // replayable forever, and our idempotency table only protects against
    // events we have already seen — not against a first-time replay of an old
    // capture.
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > toleranceSeconds) {
      this.logger.warn('Rejected Calendly webhook: signature timestamp outside tolerance');
      return false;
    }

    const expected = createHmac('sha256', signingKey)
      .update(`${timestamp}.${rawBody.toString('utf8')}`)
      .digest('hex');

    return safeEqualHex(expected, provided);
  }

  /**
   * Pulls the fields we care about out of Calendly's payload.
   *
   * Written defensively — Calendly nests differently across API versions and a
   * missing nested key must not throw inside a webhook handler.
   */
  mapCalendlyInvitee(payload: Record<string, any>): CalendlyInvitee | null {
    const invitee = payload?.payload ?? payload;
    if (!invitee) return null;

    const inviteeUri = invitee.uri ?? invitee.invitee?.uri;
    if (!inviteeUri) return null;

    const scheduledEvent = invitee.scheduled_event ?? {};

    // The frontend appends ?prospect_id=... to the Calendly URL; Calendly
    // returns it in tracking.utm_content (or as a UTM param), which is how the
    // booking finds its prospect. Several keys are checked because which one
    // carries it depends on how the link was built.
    const tracking = invitee.tracking ?? {};
    const prospectId =
      tracking.utm_content ||
      tracking.utm_campaign ||
      tracking.salesforce_uuid ||
      this.findProspectIdInQuestions(invitee.questions_and_answers);

    return {
      inviteeUri,
      scheduledEventUri: scheduledEvent.uri,
      email: invitee.email,
      name: invitee.name,
      startsAt: scheduledEvent.start_time,
      endsAt: scheduledEvent.end_time,
      joinUrl:
        scheduledEvent.location?.join_url ?? scheduledEvent.location?.location,
      rescheduleUrl: invitee.reschedule_url,
      cancelUrl: invitee.cancel_url,
      cancellationReason: invitee.cancellation?.reason,
      prospectId: prospectId || undefined,
    };
  }

  /**
   * invitee.created — the prospect picked a slot.
   *
   * Creates a PENDING booking. Pending means unpaid, and that is deliberate:
   * these rows are the agent's follow-up queue (see the entity comment).
   */
  async handleCalendlyInviteeCreated(invitee: CalendlyInvitee): Promise<void> {
    const existing = await this.bookingRepository.findBySchedulerEventId(
      invitee.inviteeUri,
    );
    if (existing) {
      this.logger.log(
        `Calendly invitee ${invitee.inviteeUri} already has a booking — skipping`,
      );
      return;
    }

    if (!invitee.prospectId) {
      // We still record the booking so the slot is not invisible, but without
      // a prospect it cannot be prepped or paid for. Loud, because it means
      // the frontend stopped appending prospect_id to the scheduler URL.
      this.logger.error(
        `Calendly invitee ${invitee.inviteeUri} arrived with no prospect_id — ` +
          `check that openScheduler() is still passing it. Booking recorded unlinked.`,
      );
    }

    const booking = await this.bookingRepository.create({
      prospect_id: invitee.prospectId ?? null,
      user_id: null,
      status: 'pending',
      scheduler_provider: 'calendly',
      scheduler_event_id: invitee.inviteeUri,
      scheduler_invitee_id: invitee.scheduledEventUri,
      scheduled_at: invitee.startsAt ? new Date(invitee.startsAt) : null,
      scheduled_end_at: invitee.endsAt ? new Date(invitee.endsAt) : null,
      join_url: invitee.joinUrl ?? null,
      reschedule_url: invitee.rescheduleUrl ?? null,
      cancel_url: invitee.cancelUrl ?? null,
    });

    if (invitee.prospectId) {
      await this.summaryService.refresh(invitee.prospectId, {
        booking: {
          booking_id: booking.id,
          status: booking.status,
          scheduled_at: booking.scheduled_at,
          join_url: booking.join_url,
          reschedule_url: booking.reschedule_url,
          cancel_url: booking.cancel_url,
        },
      });
    }

    // NOTE: the prospect stage is NOT advanced to 'booked' here. Under
    // book-then-pay a held slot is not a booking until it is paid for; the
    // Stripe webhook does that.
  }

  /** invitee.canceled — the slot was released. */
  async handleCalendlyInviteeCanceled(invitee: CalendlyInvitee): Promise<void> {
    const booking = await this.bookingRepository.findBySchedulerEventId(
      invitee.inviteeUri,
    );
    if (!booking) {
      this.logger.warn(
        `Calendly cancellation for unknown invitee ${invitee.inviteeUri}`,
      );
      return;
    }

    await this.bookingRepository.update(booking.id, {
      status: 'cancelled',
      cancellation_reason: invitee.cancellationReason ?? null,
    });

    if (booking.prospect_id) {
      await this.summaryService.refresh(booking.prospect_id, {
        booking: {
          booking_id: booking.id,
          status: 'cancelled',
          scheduled_at: booking.scheduled_at,
          cancellation_reason: invitee.cancellationReason ?? null,
        },
      });
    }

    // Deliberately does NOT refund and does NOT move the prospect backwards.
    // A cancelled paid consult is a human decision (reschedule? refund?), not
    // something a webhook should make on its own.
    if (booking.status === 'confirmed') {
      this.logger.warn(
        `A PAID consultation was cancelled (booking ${booking.id}) — this needs ` +
          `an agent to decide on reschedule or refund.`,
      );
    }
  }

  // ==========================================================================
  // Stripe
  // ==========================================================================

  /**
   * checkout.session.completed — the money is in.
   *
   * This is the only place a booking becomes confirmed. It:
   *   records the payment -> flips the booking to confirmed ->
   *   advances the prospect to `booked` -> alerts the agent.
   *
   * Order matters: the payment record is written first so that if anything
   * downstream throws, the money is still accounted for and the rest can be
   * replayed by hand.
   */
  async handleStripeCheckoutCompleted(session: {
    id: string;
    payment_intent?: string | null;
    amount_total?: number | null;
    currency?: string | null;
    metadata?: Record<string, string> | null;
  }): Promise<void> {
    const payment = await this.paymentsService.markPaidFromSession(session);

    // null = already processed, or unrecoverable. Either way, no side effects.
    if (!payment) return;

    const prospectId = payment.prospect_id;

    const booking = payment.booking_id
      ? await this.bookingRepository.findById(payment.booking_id).catch(() => null)
      : await this.bookingRepository.findLatestForProspect(prospectId);

    if (booking) {
      await this.bookingRepository.update(booking.id, { status: 'confirmed' });
    } else {
      this.logger.error(
        `Payment ${payment.id} completed but no booking was found for prospect ` +
          `${prospectId} — the consult is paid for with no slot held.`,
      );
    }

    await this.prospectService.advanceStage(prospectId, 'booked');

    const summary = await this.summaryService.get(prospectId);

    await this.summaryService.refresh(prospectId, {
      payment: {
        payment_id: payment.id,
        status: payment.status,
        amount_cents: payment.amount_cents,
        currency: payment.currency,
        paid_at: payment.paid_at,
      },
      ...(booking
        ? {
            booking: {
              booking_id: booking.id,
              status: 'confirmed',
              scheduled_at: booking.scheduled_at,
              join_url: booking.join_url,
              reschedule_url: booking.reschedule_url,
              cancel_url: booking.cancel_url,
            },
          }
        : {}),
    });

    // Alert last, and never let it fail the webhook — Stripe would retry the
    // whole thing and we would double-confirm just because Slack was down.
    try {
      const prospect = await this.prospectService.findById(prospectId);
      await this.notifier.notifyBookingConfirmed(prospect, {
        scheduledAt: booking?.scheduled_at ?? null,
        amountCents: payment.amount_cents ?? null,
        currency: payment.currency,
        recommendedSubclass:
          (summary?.eligibility as any)?.recommended_subclass ?? null,
        blockers: (summary?.eligibility as any)?.blockers ?? [],
        openQuestions: (summary?.eligibility as any)?.open_questions ?? [],
      });
    } catch (error) {
      this.logger.error(
        `Booking confirmed for prospect ${prospectId} but the agent alert failed: ${(error as Error).message}`,
      );
    }
  }

  // ==========================================================================
  // Shared
  // ==========================================================================

  /**
   * Wraps a handler in the idempotency claim + status bookkeeping.
   *
   * Returns true if the event was handled, false if it was a duplicate.
   * Throws only if the handler itself threw — the controller decides what
   * status code that becomes, because the status code controls whether the
   * provider retries.
   */
  async processOnce(
    provider: 'calendly' | 'stripe',
    externalId: string,
    eventType: string,
    payload: Record<string, any>,
    handler: () => Promise<void>,
  ): Promise<boolean> {
    const event = await this.webhookEventRepository.claim(
      provider,
      externalId,
      eventType,
      payload,
    );
    if (!event) return false;

    try {
      await handler();
      await this.webhookEventRepository.markProcessed(event.id);
      return true;
    } catch (error) {
      await this.webhookEventRepository.markFailed(
        event.id,
        (error as Error).message,
      );
      throw error;
    }
  }

  private findProspectIdInQuestions(
    questionsAndAnswers?: Array<{ question?: string; answer?: string }>,
  ): string | undefined {
    if (!Array.isArray(questionsAndAnswers)) return undefined;
    const match = questionsAndAnswers.find((qa) =>
      /reference|prospect/i.test(qa.question ?? ''),
    );
    return match?.answer?.trim() || undefined;
  }
}

/**
 * Constant-time compare of two hex digests. Length is checked first because
 * timingSafeEqual throws on a length mismatch — and the length of a digest is
 * not a secret, so leaking that comparison is fine.
 */
function safeEqualHex(expected: string, provided: string): boolean {
  if (expected.length !== provided.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(provided, 'hex'),
    );
  } catch {
    return false;
  }
}
