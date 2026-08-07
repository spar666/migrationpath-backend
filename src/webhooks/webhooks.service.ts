import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { WebhookEventRepository } from './webhook-event.repository';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { ProspectNotifierService } from '../prospect/prospect-notifier.service';
import { PaymentsService } from '../payments/payments.service';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';

/**
 * Narrows an unknown value to a readable object.
 *
 * Returns an empty object rather than null so that a chain of lookups against
 * a payload that arrived in an unexpected shape yields `undefined` fields
 * instead of throwing. A webhook handler that throws while parsing gives the
 * provider a 5xx and earns a retry of a payload we will fail on identically
 * every time.
 */
function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

/** A string field, or undefined if it is absent or the wrong type. */
function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** A list of strings, dropping anything that is not one. Never undefined. */
function strList(value: unknown): string[] {
  return Array.isArray(value)
    ? (value as unknown[]).filter(
        (entry): entry is string => typeof entry === 'string',
      )
    : [];
}

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
export class WebhooksService implements OnModuleInit {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly webhookEventRepository: WebhookEventRepository,
    private readonly prospectService: ProspectService,
    private readonly summaryService: ProspectSummaryService,
    private readonly notifier: ProspectNotifierService,
    private readonly paymentsService: PaymentsService,
    private readonly bookingRepository: ConsultationBookingRepository,
  ) {}

  /**
   * Hands the reconciliation sweep the same confirmation routine the webhook
   * uses.
   *
   * Wired at boot rather than injected, because PaymentsService cannot depend
   * on this service — it is already a dependency OF it, and the reverse edge
   * would make the module graph circular. The alternative, reimplementing
   * confirmation inside the sweep, gives you two paths that confirm bookings
   * and only one of them exercised regularly.
   */
  onModuleInit(): void {
    this.paymentsService.setReconciliationConfirmer((session) =>
      this.handleStripeCheckoutCompleted(session),
    );
  }

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
      this.logger.warn(
        'Rejected Calendly webhook: signature timestamp outside tolerance',
      );
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
  mapCalendlyInvitee(payload: unknown): CalendlyInvitee | null {
    // `unknown`, not `Record<string, any>`. This is data from another company's
    // API arriving over the wire, and typing it as `any` let every read below
    // compile whether or not the field existed — which is exactly the mistake
    // the defensive style was trying to guard against, made invisible.
    const root = asRecord(payload);
    // Calendly wraps the invitee in `payload` on some API versions and sends it
    // at the top level on others. `asRecord` returns {} rather than null, so
    // the presence of the key has to be checked directly — `?? root` would
    // never fire and an unwrapped payload would silently map to nothing.
    const invitee = 'payload' in root ? asRecord(root.payload) : root;

    const inviteeUri = str(invitee.uri) ?? str(asRecord(invitee.invitee).uri);
    if (!inviteeUri) return null;

    const scheduledEvent = asRecord(invitee.scheduled_event);
    const location = asRecord(scheduledEvent.location);

    // The frontend appends ?prospect_id=... to the Calendly URL; Calendly
    // returns it in tracking.utm_content (or as a UTM param), which is how the
    // booking finds its prospect. Several keys are checked because which one
    // carries it depends on how the link was built.
    const tracking = asRecord(invitee.tracking);
    const prospectId =
      str(tracking.utm_content) ??
      str(tracking.utm_campaign) ??
      str(tracking.salesforce_uuid) ??
      this.findProspectIdInQuestions(invitee.questions_and_answers);

    return {
      inviteeUri,
      scheduledEventUri: str(scheduledEvent.uri),
      email: str(invitee.email),
      name: str(invitee.name),
      startsAt: str(scheduledEvent.start_time),
      endsAt: str(scheduledEvent.end_time),
      joinUrl: str(location.join_url) ?? str(location.location),
      rescheduleUrl: str(invitee.reschedule_url),
      cancelUrl: str(invitee.cancel_url),
      cancellationReason: str(asRecord(invitee.cancellation).reason),
      prospectId,
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
      // A row the browser reported, now being caught up by the authoritative
      // source. Overwrite rather than skip: the browser's times were its own
      // account of what Calendly showed it, and Calendly's are the real ones.
      if (existing.client_reported_at) {
        await this.adoptClientReportedBooking(existing.id, invitee);
        return;
      }

      this.logger.log(
        `Calendly invitee ${invitee.inviteeUri} already has a booking — skipping`,
      );
      return;
    }

    // No match on the invitee URI, but the browser may have reported this
    // booking without one — older embeds do not include it in the message. A
    // pending, browser-reported row for the same prospect is that booking, and
    // creating a second one would leave the agent with two rows for one slot
    // and no way to tell which the visitor actually holds.
    if (invitee.prospectId) {
      const clientReported =
        await this.bookingRepository.findClientReportedForProspect(
          invitee.prospectId,
        );
      if (clientReported) {
        await this.adoptClientReportedBooking(clientReported.id, invitee);
        return;
      }
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
      // The only contact detail an unlinked booking will ever have. Kept
      // separate from the prospect's own email: the two differing is exactly
      // what makes a booking hard to reconcile, and worth being able to see.
      invitee_email: invitee.email ?? null,
      invitee_name: invitee.name ?? null,
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

  /**
   * Replaces a browser-reported booking's provisional detail with Calendly's.
   *
   * `client_reported_at` is cleared, which is the point: from here the row is
   * confirmed by the provider, and nothing downstream needs to treat it with
   * suspicion any more.
   *
   * The status is untouched. It was `pending` and it stays `pending` — the
   * invitee webhook means a slot is held, never that it is paid for, and only
   * Stripe may decide otherwise.
   */
  private async adoptClientReportedBooking(
    bookingId: string,
    invitee: CalendlyInvitee,
  ): Promise<void> {
    await this.bookingRepository.update(bookingId, {
      scheduler_event_id: invitee.inviteeUri,
      scheduler_invitee_id: invitee.scheduledEventUri,
      // The browser never sees these — Calendly's message carries the URIs and
      // times, not who typed what into the form. This is the only path that
      // can fill them in.
      invitee_email: invitee.email ?? null,
      invitee_name: invitee.name ?? null,
      scheduled_at: invitee.startsAt ? new Date(invitee.startsAt) : null,
      scheduled_end_at: invitee.endsAt ? new Date(invitee.endsAt) : null,
      join_url: invitee.joinUrl ?? null,
      reschedule_url: invitee.rescheduleUrl ?? null,
      cancel_url: invitee.cancelUrl ?? null,
      client_reported_at: null,
    });

    this.logger.log(
      `Calendly invitee ${invitee.inviteeUri} adopted booking ${bookingId}, ` +
        `which the visitor's browser had reported first.`,
    );

    if (invitee.prospectId) {
      await this.summaryService.refresh(invitee.prospectId);
    }
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
   *
   * EVERY STEP BELOW IS SAFE TO RUN TWICE, and it has to be. There is no
   * transaction spanning a payment row, a booking row, a prospect stage and a
   * Slack message, so a restart can land between any two of them — and the
   * retry that follows must be able to finish the job rather than trip over
   * the part that already succeeded. Marking a paid payment paid, confirming a
   * confirmed booking and advancing an already-advanced stage are all no-ops;
   * that is a property to preserve, not an accident.
   */
  async handleStripeCheckoutCompleted(session: {
    id: string;
    payment_intent?: string | null;
    amount_total?: number | null;
    currency?: string | null;
    metadata?: Record<string, string> | null;
  }): Promise<void> {
    const payment = await this.paymentsService.markPaidFromSession(session);

    // null means there is genuinely nothing to act on — no local row and no
    // prospect in the metadata either. Not "already handled": a payment we have
    // already marked paid still comes back here, because the steps after it may
    // not have run.
    if (!payment) return;

    const prospectId = payment.prospect_id;

    const booking = payment.booking_id
      ? await this.bookingRepository
          .findById(payment.booking_id)
          .catch(() => null)
      : await this.bookingRepository.findLatestForProspect(prospectId);

    if (!booking) {
      // Loud, and deliberately not fatal. Throwing would make Stripe retry
      // forever against a booking that does not exist, and the money is real
      // either way — an agent needs to see this, not a retry loop.
      this.logger.error(
        `Payment ${payment.id} completed but no booking was found for prospect ` +
          `${prospectId} — the consult is paid for with no slot held.`,
      );
    } else if (booking.status === 'confirmed') {
      this.logger.log(
        `Booking ${booking.id} was already confirmed — continuing with the ` +
          `remaining steps in case an earlier attempt stopped here.`,
      );
    } else {
      await this.bookingRepository.update(booking.id, { status: 'confirmed' });
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
      // The summary is a derived jsonb blob whose shape varies by funnel, so
      // it is read through the same narrowing helpers as the webhook payloads
      // rather than asserted with `as any`. An engine that stops emitting
      // `blockers` should give the agent an empty list, not a crash in the
      // alert that tells them a booking was paid for.
      const eligibility = asRecord(summary?.eligibility);
      await this.notifier.notifyBookingConfirmed(prospect, {
        scheduledAt: booking?.scheduled_at ?? null,
        amountCents: payment.amount_cents ?? null,
        currency: payment.currency,
        recommendedSubclass: str(eligibility.recommended_subclass) ?? null,
        blockers: strList(eligibility.blockers),
        openQuestions: strList(eligibility.open_questions),
      });
    } catch (error) {
      this.logger.error(
        `Booking confirmed for prospect ${prospectId} but the agent alert failed: ${(error as Error).message}`,
      );
    }
  }

  /**
   * A checkout session that ended without money.
   *
   * Two ways in: a delayed payment method that failed to settle, and a session
   * nobody came back to. Both close the payment row off, which keeps it out of
   * the session-reuse lookup and out of the reconciliation sweep — the sweep
   * exists to ask Stripe about sessions whose fate we do not know, and these
   * are ones Stripe has just told us about.
   *
   * The BOOKING is deliberately left alone. It stays `pending`, which is
   * accurate: the slot is still held and the agent's follow-up queue is exactly
   * where this person belongs. Cancelling their booking because a payment
   * failed would take the slot away from someone who may simply need to try a
   * different card.
   */
  async handleStripeSessionUnpaid(
    sessionId: string,
    outcome: 'failed' | 'expired',
  ): Promise<void> {
    const payment = await this.paymentsService.markSessionUnpaid(
      sessionId,
      outcome,
    );

    if (!payment) {
      // No local row for a session Stripe knows about. Not fatal — there is
      // nothing to charge and nothing to correct — but worth noticing, because
      // it means a session was created outside this service.
      this.logger.warn(
        `Stripe session ${sessionId} ${outcome}, but we have no payment row ` +
          `for it. Nothing to update.`,
      );
      return;
    }

    await this.summaryService.refresh(payment.prospect_id);
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
    questionsAndAnswers: unknown,
  ): string | undefined {
    if (!Array.isArray(questionsAndAnswers)) return undefined;

    for (const entry of questionsAndAnswers as unknown[]) {
      const qa = asRecord(entry);
      if (/reference|prospect/i.test(str(qa.question) ?? '')) {
        return str(qa.answer)?.trim() || undefined;
      }
    }
    return undefined;
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
