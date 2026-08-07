import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'crypto';
import { WebhooksService, type CalendlyInvitee } from './webhooks.service';
import { WebhookEventRepository } from './webhook-event.repository';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { ProspectNotifierService } from '../prospect/prospect-notifier.service';
import { PaymentsService } from '../payments/payments.service';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';

/**
 * Webhook handling — the least forgiving code in the funnel.
 *
 * Webhooks arrive unauthenticated, out of order, more than once, and
 * occasionally from someone who is not the provider at all. Three properties
 * have to hold: an unverified payload changes nothing, a replayed event
 * changes nothing twice, and a failure in a non-essential step (the agent
 * alert) never causes the provider to retry a transaction that already
 * succeeded.
 */

const SIGNING_KEY = 'test-signing-key';

function calendlySignature(body: string, key = SIGNING_KEY, secondsAgo = 0) {
  const t = Math.floor(Date.now() / 1000) - secondsAgo;
  const v1 = createHmac('sha256', key).update(`${t}.${body}`).digest('hex');
  return { header: `t=${t},v1=${v1}`, body };
}

describe('WebhooksService', () => {
  let service: WebhooksService;
  let events: {
    claim: jest.Mock;
    markProcessed: jest.Mock;
    markFailed: jest.Mock;
  };
  let prospects: { advanceStage: jest.Mock; findById: jest.Mock };
  let summaries: { get: jest.Mock; refresh: jest.Mock };
  let notifier: { notifyBookingConfirmed: jest.Mock };
  let payments: {
    markPaidFromSession: jest.Mock;
    markSessionUnpaid: jest.Mock;
  };
  let bookings: {
    create: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    findBySchedulerEventId: jest.Mock;
    findClientReportedForProspect: jest.Mock;
    findLatestForProspect: jest.Mock;
  };

  beforeEach(async () => {
    events = {
      claim: jest.fn().mockResolvedValue({ id: 'event-1' }),
      markProcessed: jest.fn().mockResolvedValue({}),
      markFailed: jest.fn().mockResolvedValue({}),
    };
    prospects = {
      advanceStage: jest.fn().mockResolvedValue({}),
      findById: jest
        .fn()
        .mockResolvedValue({ id: 'prospect-1', human_ref: 'MP-1' }),
    };
    summaries = {
      get: jest.fn().mockResolvedValue({ eligibility: {} }),
      refresh: jest.fn().mockResolvedValue({}),
    };
    notifier = {
      notifyBookingConfirmed: jest.fn().mockResolvedValue(undefined),
    };
    payments = {
      markPaidFromSession: jest.fn(),
      markSessionUnpaid: jest.fn().mockResolvedValue(null),
    };
    bookings = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'booking-1', status: 'pending' }),
      update: jest.fn().mockResolvedValue({}),
      findById: jest.fn().mockResolvedValue({ id: 'booking-1' }),
      findBySchedulerEventId: jest.fn().mockResolvedValue(null),
      // Null by default: no browser-reported row to adopt, so invitee.created
      // takes its original path of creating the booking outright.
      findClientReportedForProspect: jest.fn().mockResolvedValue(null),
      findLatestForProspect: jest.fn().mockResolvedValue({ id: 'booking-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: WebhookEventRepository, useValue: events },
        { provide: ProspectService, useValue: prospects },
        { provide: ProspectSummaryService, useValue: summaries },
        { provide: ProspectNotifierService, useValue: notifier },
        { provide: PaymentsService, useValue: payments },
        { provide: ConsultationBookingRepository, useValue: bookings },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  // =========================================================================

  describe('Calendly signature verification', () => {
    const body = JSON.stringify({ event: 'invitee.created' });

    it('accepts a correctly signed payload', () => {
      const { header } = calendlySignature(body);
      expect(
        service.verifyCalendlySignature(Buffer.from(body), header, SIGNING_KEY),
      ).toBe(true);
    });

    it('rejects a missing signature header', () => {
      // Fail closed. An unverified booking endpoint lets anyone write slots
      // into the agent queue.
      expect(
        service.verifyCalendlySignature(
          Buffer.from(body),
          undefined,
          SIGNING_KEY,
        ),
      ).toBe(false);
    });

    it('rejects a signature made with the wrong key', () => {
      const { header } = calendlySignature(body, 'attacker-key');
      expect(
        service.verifyCalendlySignature(Buffer.from(body), header, SIGNING_KEY),
      ).toBe(false);
    });

    it('rejects a valid signature over a different body', () => {
      // The tampering case: signature is real, payload was swapped.
      const { header } = calendlySignature(body);
      const tampered = Buffer.from(
        JSON.stringify({ event: 'invitee.canceled' }),
      );
      expect(
        service.verifyCalendlySignature(tampered, header, SIGNING_KEY),
      ).toBe(false);
    });

    it('rejects a stale signature outside the tolerance window', () => {
      // Without this a captured request stays replayable forever — and the
      // idempotency table only protects against events we have already seen,
      // not a first-time replay of an old capture.
      const { header } = calendlySignature(body, SIGNING_KEY, 600);
      expect(
        service.verifyCalendlySignature(Buffer.from(body), header, SIGNING_KEY),
      ).toBe(false);
    });

    it('accepts one just inside the window', () => {
      const { header } = calendlySignature(body, SIGNING_KEY, 60);
      expect(
        service.verifyCalendlySignature(Buffer.from(body), header, SIGNING_KEY),
      ).toBe(true);
    });

    it('rejects a malformed header rather than throwing', () => {
      for (const header of ['', 'garbage', 't=', 'v1=abc', 't=abc,v1=def']) {
        expect(
          service.verifyCalendlySignature(
            Buffer.from(body),
            header,
            SIGNING_KEY,
          ),
        ).toBe(false);
      }
    });
  });

  // =========================================================================

  describe('Calendly payload mapping', () => {
    it('finds the prospect id in utm_content', () => {
      // This is the link back to our record. If it stops arriving, bookings
      // land unlinked and nobody can be prepped or charged.
      const mapped = service.mapCalendlyInvitee({
        payload: {
          uri: 'https://api.calendly.com/invitees/1',
          tracking: { utm_content: 'prospect-1' },
        },
      });
      expect(mapped?.prospectId).toBe('prospect-1');
    });

    it('falls back through the other tracking fields', () => {
      const mapped = service.mapCalendlyInvitee({
        payload: {
          uri: 'https://api.calendly.com/invitees/1',
          tracking: { utm_campaign: 'MP-7F3K9A' },
        },
      });
      expect(mapped?.prospectId).toBe('MP-7F3K9A');
    });

    it('falls back to a reference question when tracking is empty', () => {
      const mapped = service.mapCalendlyInvitee({
        payload: {
          uri: 'https://api.calendly.com/invitees/1',
          questions_and_answers: [
            { question: 'Your reference number', answer: ' MP-7F3K9A ' },
          ],
        },
      });
      expect(mapped?.prospectId).toBe('MP-7F3K9A');
    });

    it('returns null for a payload with no invitee uri', () => {
      expect(service.mapCalendlyInvitee({ payload: {} })).toBeNull();
    });

    it('reads an invitee sent at the top level, not wrapped in payload', () => {
      // Calendly nests under `payload` on some API versions and not on others,
      // and only the wrapped shape was covered — so a refactor that broke the
      // unwrapped one would have gone unnoticed until bookings stopped linking.
      const mapped = service.mapCalendlyInvitee({
        uri: 'https://api.calendly.com/invitees/9',
        tracking: { utm_content: 'prospect-9' },
      });

      expect(mapped?.inviteeUri).toBe('https://api.calendly.com/invitees/9');
      expect(mapped?.prospectId).toBe('prospect-9');
    });

    it('survives a payload whose nested objects are the wrong type', () => {
      // Throwing here returns a 5xx, which earns a retry of a payload we will
      // fail on identically every time.
      expect(() =>
        service.mapCalendlyInvitee({
          payload: {
            uri: 'https://api.calendly.com/invitees/9',
            scheduled_event: 'not-an-object',
            tracking: 42,
            questions_and_answers: 'nope',
          },
        }),
      ).not.toThrow();
      expect(service.mapCalendlyInvitee({})).toBeNull();
    });

    it('does not throw on deeply missing nested keys', () => {
      // Calendly nests differently across API versions, and a TypeError
      // inside a handler turns into a retry storm.
      expect(() =>
        service.mapCalendlyInvitee({
          payload: { uri: 'https://api.calendly.com/invitees/1' },
        }),
      ).not.toThrow();
    });
  });

  // =========================================================================

  describe('invitee.created', () => {
    const invitee = {
      inviteeUri: 'https://api.calendly.com/invitees/1',
      scheduledEventUri: 'https://api.calendly.com/events/1',
      startsAt: '2026-08-01T02:00:00Z',
      endsAt: '2026-08-01T02:45:00Z',
      prospectId: 'prospect-1',
      // Typed rather than `as never`: the adoption tests read startsAt/endsAt
      // back off this fixture to assert the webhook's values win.
    } satisfies CalendlyInvitee;

    /**
     * The browser now reports the booking as soon as Calendly confirms it, so
     * that checkout is not blocked waiting on this webhook. That means by the
     * time the webhook lands there is often already a row for this slot — and
     * the wrong move is to create a second one, leaving the agent with two
     * bookings for one appointment and no way to tell which is real.
     */
    describe('when the browser reported the booking first', () => {
      it('adopts the existing row rather than creating another', async () => {
        bookings.findClientReportedForProspect.mockResolvedValue({
          id: 'client-b1',
          client_reported_at: new Date(),
        });

        await service.handleCalendlyInviteeCreated(invitee);

        expect(bookings.create).not.toHaveBeenCalled();
        expect(bookings.update).toHaveBeenCalledWith(
          'client-b1',
          expect.objectContaining({
            scheduler_event_id: invitee.inviteeUri,
          }),
        );
      });

      it('fills in the contact details the browser could not see', async () => {
        // Calendly's message to the embed carries URIs and times, not what the
        // visitor typed into the form. This path is the only source for them.
        bookings.findClientReportedForProspect.mockResolvedValue({
          id: 'client-b1',
          client_reported_at: new Date(),
        });

        await service.handleCalendlyInviteeCreated({
          ...invitee,
          email: 'mina@example.com',
          name: 'Mina Chen',
        });

        expect(bookings.update.mock.calls[0][1]).toMatchObject({
          invitee_email: 'mina@example.com',
          invitee_name: 'Mina Chen',
        });
      });

      it("overwrites the browser's times with Calendly's own", async () => {
        // The browser reported what it was shown; Calendly reports what is
        // booked. Only one of those is authoritative.
        bookings.findClientReportedForProspect.mockResolvedValue({
          id: 'client-b1',
          client_reported_at: new Date(),
        });

        await service.handleCalendlyInviteeCreated(invitee);

        const patch = bookings.update.mock.calls[0][1];
        expect(patch.scheduled_at).toEqual(new Date(invitee.startsAt));
        expect(patch.scheduled_end_at).toEqual(new Date(invitee.endsAt));
      });

      it('clears the client-reported flag once Calendly has confirmed it', async () => {
        // From here the row is provider-confirmed and nothing downstream needs
        // to treat its detail as provisional.
        bookings.findClientReportedForProspect.mockResolvedValue({
          id: 'client-b1',
          client_reported_at: new Date(),
        });

        await service.handleCalendlyInviteeCreated(invitee);
        expect(bookings.update.mock.calls[0][1].client_reported_at).toBeNull();
      });

      it('leaves it PENDING — an invitee webhook never means paid', async () => {
        bookings.findClientReportedForProspect.mockResolvedValue({
          id: 'client-b1',
          client_reported_at: new Date(),
        });

        await service.handleCalendlyInviteeCreated(invitee);
        expect(bookings.update.mock.calls[0][1]).not.toHaveProperty('status');
      });

      it('adopts by invitee URI when the browser captured one', async () => {
        // The stronger match: same idempotency key, so this is unambiguously
        // the same booking rather than an inference from the prospect.
        bookings.findBySchedulerEventId.mockResolvedValue({
          id: 'client-b1',
          client_reported_at: new Date(),
        });

        await service.handleCalendlyInviteeCreated(invitee);

        expect(bookings.create).not.toHaveBeenCalled();
        expect(bookings.update).toHaveBeenCalledWith(
          'client-b1',
          expect.objectContaining({ client_reported_at: null }),
        );
      });
    });

    it('keeps the contact details the invitee typed into Calendly', async () => {
      // These were mapped out of the payload and then discarded. Two things
      // depended on them and neither worked: an unlinked booking had NO contact
      // detail at all, despite the handler logging that such a row is
      // "recoverable by matching email addresses"; and a prospect who books
      // under a different address could not be spotted.
      await service.handleCalendlyInviteeCreated({
        ...invitee,
        email: 'mina.work@example.com',
        name: 'Mina Chen',
      });

      expect(bookings.create.mock.calls[0][0]).toMatchObject({
        invitee_email: 'mina.work@example.com',
        invitee_name: 'Mina Chen',
      });
    });

    it('records contact details even when the booking cannot be linked', async () => {
      // The case they matter most in. With no prospect id this row is
      // orphaned, and the email is the only thing anyone can reconcile it by.
      await service.handleCalendlyInviteeCreated({
        ...invitee,
        prospectId: undefined,
        email: 'orphan@example.com',
      });

      expect(bookings.create.mock.calls[0][0]).toMatchObject({
        prospect_id: null,
        invitee_email: 'orphan@example.com',
      });
    });

    it('creates the booking as PENDING, not confirmed', async () => {
      // Pending means unpaid, and that is the agent's follow-up queue.
      await service.handleCalendlyInviteeCreated(invitee);
      expect(bookings.create.mock.calls[0][0].status).toBe('pending');
    });

    it('does NOT advance the prospect to booked', async () => {
      // A held slot is not a booking until it is paid for. Advancing here
      // would tell the agent someone is booked when no money has moved.
      await service.handleCalendlyInviteeCreated(invitee);
      expect(prospects.advanceStage).not.toHaveBeenCalled();
    });

    it('is a no-op when the invitee already has a booking', async () => {
      bookings.findBySchedulerEventId.mockResolvedValue({ id: 'booking-1' });
      await service.handleCalendlyInviteeCreated(invitee);
      expect(bookings.create).not.toHaveBeenCalled();
    });

    it('still records an unlinked booking when the prospect id is missing', async () => {
      // Better a visible orphan than an invisible slot the agent never sees.
      await service.handleCalendlyInviteeCreated({
        ...(invitee as object),
        prospectId: undefined,
      } as never);

      expect(bookings.create).toHaveBeenCalled();
      expect(bookings.create.mock.calls[0][0].prospect_id).toBeNull();
      expect(summaries.refresh).not.toHaveBeenCalled();
    });

    it('writes the slot onto the agent summary', async () => {
      await service.handleCalendlyInviteeCreated(invitee);
      expect(summaries.refresh).toHaveBeenCalledWith(
        'prospect-1',
        expect.objectContaining({
          booking: expect.objectContaining({ booking_id: 'booking-1' }),
        }),
      );
    });
  });

  // =========================================================================

  describe('checkout.session.completed', () => {
    const session = {
      id: 'cs_test_1',
      metadata: { prospect_id: 'prospect-1', payment_id: 'payment-1' },
    };

    const paidPayment = {
      id: 'payment-1',
      prospect_id: 'prospect-1',
      booking_id: 'booking-1',
      status: 'paid',
      amount_cents: 15000,
      currency: 'aud',
      paid_at: new Date(),
    };

    /**
     * The failure this hardening exists to prevent.
     *
     * Marking a payment paid and confirming its booking are separate writes
     * with no transaction around them, so a restart can land between the two.
     * The money is taken, the booking is still pending, and the customer is
     * owed a consultation nothing in the system knows about.
     *
     * Stripe retries for days precisely so that this is recoverable — but only
     * if the retry actually re-runs the work. It used to be discarded twice
     * over: the webhook claim refused an event it had already seen, and
     * markPaidFromSession returned null for a payment already marked paid.
     */
    describe('after a crash midway through', () => {
      it('confirms a booking left pending by an interrupted attempt', async () => {
        // The payment was marked paid before the crash; the booking was not.
        payments.markPaidFromSession.mockResolvedValue(paidPayment);
        bookings.findById.mockResolvedValue({
          id: 'booking-1',
          status: 'pending',
        });

        await service.handleStripeCheckoutCompleted(session);

        expect(bookings.update).toHaveBeenCalledWith(
          'booking-1',
          expect.objectContaining({ status: 'confirmed' }),
        );
      });

      it('finishes the remaining steps when the booking was already done', async () => {
        // Crash landed one step later: booking confirmed, prospect never
        // advanced. Stopping here because the booking looks fine would leave
        // the prospect stuck at pre_screened forever.
        payments.markPaidFromSession.mockResolvedValue(paidPayment);
        bookings.findById.mockResolvedValue({
          id: 'booking-1',
          status: 'confirmed',
        });

        await service.handleStripeCheckoutCompleted(session);

        expect(prospects.advanceStage).toHaveBeenCalledWith(
          'prospect-1',
          'booked',
        );
        expect(notifier.notifyBookingConfirmed).toHaveBeenCalled();
      });

      it('does not re-confirm a booking that is already confirmed', async () => {
        // Idempotent, but not wastefully so: no pointless write.
        payments.markPaidFromSession.mockResolvedValue(paidPayment);
        bookings.findById.mockResolvedValue({
          id: 'booking-1',
          status: 'confirmed',
        });

        await service.handleStripeCheckoutCompleted(session);
        expect(bookings.update).not.toHaveBeenCalled();
      });
    });

    it('confirms the booking and advances the prospect', async () => {
      payments.markPaidFromSession.mockResolvedValue(paidPayment);

      await service.handleStripeCheckoutCompleted(session);

      expect(bookings.update).toHaveBeenCalledWith('booking-1', {
        status: 'confirmed',
      });
      expect(prospects.advanceStage).toHaveBeenCalledWith(
        'prospect-1',
        'booked',
      );
    });

    it('does nothing when there is genuinely nothing to act on', async () => {
      // null now means only one thing: no local payment row AND no prospect in
      // the session metadata, so there is no record to attach anything to.
      // An already-paid payment does NOT return null — see the crash tests
      // below for why that distinction is the whole point.
      payments.markPaidFromSession.mockResolvedValue(null);

      await service.handleStripeCheckoutCompleted(session);

      expect(bookings.update).not.toHaveBeenCalled();
      expect(prospects.advanceStage).not.toHaveBeenCalled();
      expect(notifier.notifyBookingConfirmed).not.toHaveBeenCalled();
    });

    it('alerts the agent once the money has landed', async () => {
      payments.markPaidFromSession.mockResolvedValue(paidPayment);
      await service.handleStripeCheckoutCompleted(session);
      expect(notifier.notifyBookingConfirmed).toHaveBeenCalledTimes(1);
    });

    it('does not fail the webhook when the alert throws', async () => {
      // Stripe would retry the whole event and we would re-confirm a booking
      // just because Slack was down.
      payments.markPaidFromSession.mockResolvedValue(paidPayment);
      notifier.notifyBookingConfirmed.mockRejectedValue(
        new Error('slack down'),
      );

      await expect(
        service.handleStripeCheckoutCompleted(session),
      ).resolves.toBeUndefined();

      expect(prospects.advanceStage).toHaveBeenCalled();
    });

    it('still records the payment when no booking can be found', async () => {
      // Paid with no slot held is a real, recoverable state — and the money
      // must be recorded regardless so the agent can sort it out.
      payments.markPaidFromSession.mockResolvedValue({
        ...paidPayment,
        booking_id: null,
      });
      bookings.findLatestForProspect.mockResolvedValue(null);

      await service.handleStripeCheckoutCompleted(session);

      expect(bookings.update).not.toHaveBeenCalled();
      expect(prospects.advanceStage).toHaveBeenCalledWith(
        'prospect-1',
        'booked',
      );
      expect(summaries.refresh).toHaveBeenCalledWith(
        'prospect-1',
        expect.objectContaining({ payment: expect.anything() }),
      );
    });

    it('survives a booking lookup that rejects', async () => {
      payments.markPaidFromSession.mockResolvedValue(paidPayment);
      bookings.findById.mockRejectedValue(new Error('db blip'));

      await expect(
        service.handleStripeCheckoutCompleted(session),
      ).resolves.toBeUndefined();
    });
  });

  // =========================================================================

  /**
   * A checkout session that ended without money.
   *
   * Both routes here were previously unhandled, which meant a delayed payment
   * method that failed to settle left its payment row open indefinitely — and
   * the reconciliation sweep then spent a Stripe round trip re-asking a
   * question Stripe had already answered.
   */
  describe('a session that ended unpaid', () => {
    it('closes the payment row off', async () => {
      payments.markSessionUnpaid.mockResolvedValue({
        id: 'payment-1',
        prospect_id: 'prospect-1',
      });

      await service.handleStripeSessionUnpaid('cs_test_1', 'expired');

      expect(payments.markSessionUnpaid).toHaveBeenCalledWith(
        'cs_test_1',
        'expired',
      );
    });

    it('leaves the BOOKING alone', async () => {
      // The slot is still held and this person still belongs in the follow-up
      // queue. Cancelling their booking over a failed card takes the time away
      // from someone who may simply try a different one.
      payments.markSessionUnpaid.mockResolvedValue({
        id: 'payment-1',
        prospect_id: 'prospect-1',
      });

      await service.handleStripeSessionUnpaid('cs_test_1', 'failed');

      expect(bookings.update).not.toHaveBeenCalled();
      expect(prospects.advanceStage).not.toHaveBeenCalled();
    });

    it('says so when there is no payment row to close', async () => {
      // Means a session was created outside this service. Not fatal, but not
      // something to swallow either.
      const warn = jest
        .spyOn(service['logger'], 'warn')
        .mockImplementation(() => {});
      payments.markSessionUnpaid.mockResolvedValue(null);

      await service.handleStripeSessionUnpaid('cs_unknown', 'expired');

      expect(warn).toHaveBeenCalled();
      expect(summaries.refresh).not.toHaveBeenCalled();
    });
  });

  describe('processOnce', () => {
    it('runs the handler and marks the event processed', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);

      const handled = await service.processOnce(
        'stripe',
        'evt_1',
        'checkout.session.completed',
        {},
        handler,
      );

      expect(handled).toBe(true);
      expect(handler).toHaveBeenCalled();
      expect(events.markProcessed).toHaveBeenCalledWith('event-1');
    });

    it('skips the handler entirely for a replayed event', async () => {
      // claim() returning null means we have seen this external id before.
      events.claim.mockResolvedValue(null);
      const handler = jest.fn();

      const handled = await service.processOnce(
        'stripe',
        'evt_1',
        'checkout.session.completed',
        {},
        handler,
      );

      expect(handled).toBe(false);
      expect(handler).not.toHaveBeenCalled();
    });

    it('records the failure and rethrows so the provider retries', async () => {
      // The controller turns this into a 5xx. Swallowing it would tell the
      // provider we succeeded and the event would never come back.
      const handler = jest.fn().mockRejectedValue(new Error('handler boom'));

      await expect(
        service.processOnce(
          'calendly',
          'evt_2',
          'invitee.created',
          {},
          handler,
        ),
      ).rejects.toThrow('handler boom');

      expect(events.markFailed).toHaveBeenCalledWith('event-1', 'handler boom');
      expect(events.markProcessed).not.toHaveBeenCalled();
    });

    it('claims on the provider event id, which is what makes replays cheap', async () => {
      await service.processOnce('stripe', 'evt_9', 'type', { a: 1 }, jest.fn());
      expect(events.claim).toHaveBeenCalledWith('stripe', 'evt_9', 'type', {
        a: 1,
      });
    });
  });
});
