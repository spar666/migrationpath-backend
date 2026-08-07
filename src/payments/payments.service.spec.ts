import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './payment.repository';
import { ProspectService } from '../prospect/prospect.service';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';

/**
 * Checkout session creation.
 *
 * Everything here protects one of three things: that the client cannot name
 * its own price, that nobody gets charged twice, and that a lost response
 * still leaves a row the webhook can reconcile against. Those are the failure
 * modes that cost real money rather than just annoying someone.
 */

const sessionsCreate = jest.fn();
const sessionsRetrieve = jest.fn();
jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: (...a: unknown[]) => sessionsCreate(...a),
        retrieve: (...a: unknown[]) => sessionsRetrieve(...a),
      },
    },
  })),
);

const PROSPECT = {
  id: 'prospect-1',
  human_ref: 'MP-7F3K9A',
  email: 'ada@example.com',
};

const BOOKING = { id: 'booking-1', status: 'pending' };

const CONFIG: Record<string, string> = {
  'integrations.stripe.secretKey': 'sk_test_123',
  'integrations.stripe.consultPriceId': 'price_123',
  'integrations.stripe.successUrl': 'https://app.example/consult/confirmed',
  'integrations.stripe.cancelUrl': 'https://app.example/consult/book',
};

describe('PaymentsService.createConsultationCheckout', () => {
  let service: PaymentsService;
  let payments: {
    create: jest.Mock;
    update: jest.Mock;
    hasPaidFor: jest.Mock;
    findOpenSessionForBooking: jest.Mock;
  };
  let prospects: { findById: jest.Mock };
  let bookings: { findById: jest.Mock; findLatestForProspect: jest.Mock };
  let config: Record<string, string>;

  async function build() {
    payments = {
      create: jest.fn().mockResolvedValue({ id: 'payment-1' }),
      update: jest.fn().mockResolvedValue({}),
      hasPaidFor: jest.fn().mockResolvedValue(false),
      // Null by default: no session already open for this booking, so checkout
      // takes its normal path of creating one. The reuse tests override it.
      findOpenSessionForBooking: jest.fn().mockResolvedValue(null),
    };
    prospects = { findById: jest.fn().mockResolvedValue(PROSPECT) };
    bookings = {
      findById: jest.fn().mockResolvedValue(BOOKING),
      findLatestForProspect: jest.fn().mockResolvedValue(BOOKING),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: ConfigService,
          useValue: { get: (key: string) => config[key] },
        },
        { provide: PaymentRepository, useValue: payments },
        { provide: ProspectService, useValue: prospects },
        { provide: ConsultationBookingRepository, useValue: bookings },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    config = { ...CONFIG };
    sessionsCreate.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      amount_total: 15000,
      currency: 'aud',
    });
    await build();
  });

  describe('the price', () => {
    it('comes from configuration, never from the caller', async () => {
      // If the client could name the amount, anyone could book a consult for
      // a cent. The DTO has no amount field and this proves it stays that way.
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });

      const [params] = sessionsCreate.mock.calls[0];
      expect(params.line_items).toEqual([{ price: 'price_123', quantity: 1 }]);
      expect(params).not.toHaveProperty('amount');
      expect(params.line_items[0]).not.toHaveProperty('price_data');
    });

    it('refuses to charge when no price is configured', async () => {
      // Better a 503 than a checkout for an undefined amount.
      delete config['integrations.stripe.consultPriceId'];
      await build();

      await expect(
        service.createConsultationCheckout({
          prospect_id: 'prospect-1',
        }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(sessionsCreate).not.toHaveBeenCalled();
    });

    it('rejects an amount put where the Price id belongs', async () => {
      // The obvious misreading of STRIPE_CONSULT_PRICE_ID, and one that had
      // already been made: it was set to `0.01`. Left to Stripe this surfaces
      // as a generic session failure and the visitor is told to try again
      // shortly — advice that cannot work, for a fault entirely on our side.
      config['integrations.stripe.consultPriceId'] = '0.01';
      await build();

      await expect(
        service.createConsultationCheckout({ prospect_id: 'prospect-1' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(sessionsCreate).not.toHaveBeenCalled();
    });

    it('rejects the Product id, and says which one it is', async () => {
      // The likeliest mistake by far: prod_ and price_ sit next to each other
      // on the same dashboard page. A message that only says "not a Price id"
      // leaves someone staring at an id that looks exactly right to them.
      const logged: string[] = [];
      config['integrations.stripe.consultPriceId'] = 'prod_Tjcd1bj3pWGwNg';
      await build();
      jest
        .spyOn(service['logger'], 'error')
        .mockImplementation((message: unknown) => {
          logged.push(String(message));
        });

      await expect(
        service.createConsultationCheckout({ prospect_id: 'prospect-1' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);

      expect(logged.join(' ')).toMatch(/PRODUCT id/i);
      expect(sessionsCreate).not.toHaveBeenCalled();
    });

    it('accepts a real Price id', async () => {
      // The other half of the guard: it must not reject valid configuration.
      config['integrations.stripe.consultPriceId'] = 'price_1AbCdEf';
      await build();

      await service.createConsultationCheckout({ prospect_id: 'prospect-1' });

      const [params] = sessionsCreate.mock.calls[0];
      expect(params.line_items).toEqual([
        { price: 'price_1AbCdEf', quantity: 1 },
      ]);
    });

    it('refuses when the return URLs are missing', async () => {
      delete config['integrations.stripe.successUrl'];
      await build();

      await expect(
        service.createConsultationCheckout({
          prospect_id: 'prospect-1',
        }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  /**
   * Every checkout session is a live, chargeable link that stays payable until
   * Stripe expires it. A page reload, or a first attempt that died between our
   * row being written and Stripe answering, must not leave two of them against
   * one booking — whichever the visitor happens to open, the other is still a
   * way to be charged again.
   */
  describe('reusing an open session', () => {
    const openPayment = {
      id: 'payment-old',
      provider_session_id: 'cs_test_open',
    };

    it('hands back the existing session instead of minting a second', async () => {
      payments.findOpenSessionForBooking.mockResolvedValue(openPayment);
      sessionsRetrieve.mockResolvedValue({
        status: 'open',
        url: 'https://checkout.stripe.com/c/pay/cs_test_open',
      });

      const result = await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });

      expect(sessionsCreate).not.toHaveBeenCalled();
      expect(result.checkout_url).toContain('cs_test_open');
      expect(result.payment_id).toBe('payment-old');
    });

    it('creates a fresh one when Stripe has closed the old session', async () => {
      // Handing back a dead link looks to the visitor exactly like a broken
      // pay button, which is worse than the duplicate it was avoiding.
      payments.findOpenSessionForBooking.mockResolvedValue(openPayment);
      sessionsRetrieve.mockResolvedValue({ status: 'expired', url: null });

      await service.createConsultationCheckout({ prospect_id: 'prospect-1' });

      expect(sessionsCreate).toHaveBeenCalled();
      expect(payments.update).toHaveBeenCalledWith('payment-old', {
        status: 'expired',
      });
    });

    it('still takes the payment when Stripe cannot be reached', async () => {
      // A possible duplicate session is visible and refundable. A refused
      // payment is a lost sale, which is the worse of the two.
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
      payments.findOpenSessionForBooking.mockResolvedValue(openPayment);
      sessionsRetrieve.mockRejectedValue(new Error('stripe down'));

      const result = await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });

      expect(sessionsCreate).toHaveBeenCalled();
      expect(result.checkout_url).toContain('cs_test_123');
    });
  });

  describe('double-charge protection', () => {
    it('rejects a prospect who has already paid', async () => {
      payments.hasPaidFor.mockResolvedValue(true);

      await expect(
        service.createConsultationCheckout({
          prospect_id: 'prospect-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(sessionsCreate).not.toHaveBeenCalled();
    });

    it('sends an idempotency key so a double-clicked button makes one session', async () => {
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });

      const [, options] = sessionsCreate.mock.calls[0];
      expect(options.idempotencyKey).toBe('consult-payment-1');
    });

    it('scopes the key to the payment row, so a genuine retry gets a fresh session', async () => {
      payments.create.mockResolvedValue({ id: 'payment-2' });
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });

      const [, options] = sessionsCreate.mock.calls[0];
      expect(options.idempotencyKey).toBe('consult-payment-2');
    });
  });

  describe('the booking requirement', () => {
    it('uses the booking id when the caller supplies one', async () => {
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
        booking_id: 'booking-9',
      });

      expect(bookings.findById).toHaveBeenCalledWith('booking-9');
      expect(bookings.findLatestForProspect).not.toHaveBeenCalled();
    });

    it('falls back to the prospect’s latest booking', async () => {
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });
      expect(bookings.findLatestForProspect).toHaveBeenCalledWith('prospect-1');
    });

    it('refuses to take money with no slot held', async () => {
      // Book-then-pay. Payment without a booking would leave money against
      // nothing, which is a refund conversation.
      bookings.findLatestForProspect.mockResolvedValue(null);

      await expect(
        service.createConsultationCheckout({
          prospect_id: 'prospect-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(sessionsCreate).not.toHaveBeenCalled();
    });
  });

  describe('unknown prospects', () => {
    it('propagates the not-found rather than charging', async () => {
      // This also stops the endpoint being used to probe for valid prospect
      // ids with a real charge attached.
      prospects.findById.mockRejectedValue(new NotFoundException());

      await expect(
        service.createConsultationCheckout({ prospect_id: 'nope' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(sessionsCreate).not.toHaveBeenCalled();
    });
  });

  describe('the local ledger row', () => {
    it('is written before Stripe is called', async () => {
      // If Stripe succeeds and our response is lost in flight, the webhook
      // still has a row to reconcile against.
      const order: string[] = [];
      payments.create.mockImplementation(async () => {
        order.push('ledger');
        return { id: 'payment-1' };
      });
      sessionsCreate.mockImplementation(async () => {
        order.push('stripe');
        return { id: 'cs_1', url: 'https://checkout.example', amount_total: 1 };
      });

      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });

      expect(order).toEqual(['ledger', 'stripe']);
    });

    it('starts as created — never paid', async () => {
      // Only a signature-verified webhook may move a payment to paid.
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });
      expect(payments.create.mock.calls[0][0].status).toBe('created');
    });

    it('records the session id and amount Stripe reported', async () => {
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });

      expect(payments.update).toHaveBeenCalledWith(
        'payment-1',
        expect.objectContaining({
          provider_session_id: 'cs_test_123',
          amount_cents: 15000,
        }),
      );
    });

    it('marks the row failed when Stripe DEFINITELY rejected the call', async () => {
      // Stripe answered and said no, so no session exists. Writing the row off
      // is correct and keeps it out of the reconciliation sweep.
      sessionsCreate.mockRejectedValue(
        Object.assign(new Error('No such price'), {
          type: 'StripeInvalidRequestError',
        }),
      );

      await expect(
        service.createConsultationCheckout({ prospect_id: 'prospect-1' }),
      ).rejects.toThrow();
      expect(payments.update).toHaveBeenCalledWith('payment-1', {
        status: 'failed',
      });
    });

    it('does NOT write the row off when we never got an answer', async () => {
      // A timeout is not a refusal. Stripe may well have created a session
      // that is sitting there payable, and marking this failed removed it from
      // the reconciliation sweep — so a visitor could pay through a session we
      // had written off, and nothing would ever confirm the booking.
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
      sessionsCreate.mockRejectedValue(
        Object.assign(new Error('socket hang up'), {
          type: 'StripeConnectionError',
        }),
      );

      await expect(
        service.createConsultationCheckout({ prospect_id: 'prospect-1' }),
      ).rejects.toThrow();

      expect(payments.update).not.toHaveBeenCalledWith('payment-1', {
        status: 'failed',
      });
    });

    it('treats an unrecognised error as unknown, not as a rejection', async () => {
      // Fails safe. A bug in our own code between the call and the check
      // should not silently write off a payment that may exist.
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
      sessionsCreate.mockRejectedValue(new Error('something odd'));

      await expect(
        service.createConsultationCheckout({ prospect_id: 'prospect-1' }),
      ).rejects.toThrow();

      expect(payments.update).not.toHaveBeenCalledWith('payment-1', {
        status: 'failed',
      });
    });

    it('records the session id even when it comes back unusable', async () => {
      // A session with no URL is useless to us and still a real, payable object
      // at Stripe. Throwing without storing the id would leave a row that
      // nothing could ever match a payment to.
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
      sessionsCreate.mockResolvedValue({ id: 'cs_1', url: null });

      await expect(
        service.createConsultationCheckout({ prospect_id: 'prospect-1' }),
      ).rejects.toThrow();

      expect(payments.update).toHaveBeenCalledWith(
        'payment-1',
        expect.objectContaining({ provider_session_id: 'cs_1' }),
      );
    });
  });

  describe('reconciliation handles', () => {
    it('attaches the ids the webhook needs to find its way back', async () => {
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });

      const [params] = sessionsCreate.mock.calls[0];
      expect(params.metadata).toMatchObject({
        prospect_id: 'prospect-1',
        human_ref: 'MP-7F3K9A',
        booking_id: 'booking-1',
        payment_id: 'payment-1',
        purpose: 'consultation',
      });
    });

    it('sets client_reference_id, which is what the dashboard search box uses', async () => {
      // Metadata is richer, but an agent reconciling by hand searches on this.
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });
      expect(sessionsCreate.mock.calls[0][0].client_reference_id).toBe(
        'MP-7F3K9A',
      );
    });

    it('puts the reference on the success URL so the return page can identify itself', async () => {
      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });
      expect(sessionsCreate.mock.calls[0][0].success_url).toBe(
        'https://app.example/consult/confirmed?ref=MP-7F3K9A',
      );
    });

    it('appends with & when the success URL already has a query string', async () => {
      config['integrations.stripe.successUrl'] =
        'https://app.example/consult/confirmed?utm=x';
      await build();

      await service.createConsultationCheckout({
        prospect_id: 'prospect-1',
      });
      expect(sessionsCreate.mock.calls[0][0].success_url).toContain(
        '?utm=x&ref=MP-7F3K9A',
      );
    });
  });

  describe('when Stripe is not configured at all', () => {
    it('fails the request instead of the whole app at boot', async () => {
      // The rest of the API must still run in environments that take no
      // payments; only this endpoint should break.
      delete config['integrations.stripe.secretKey'];
      await build();

      await expect(
        service.createConsultationCheckout({
          prospect_id: 'prospect-1',
        }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });
});

/**
 * Closing off a session that ended without money.
 *
 * The one write in this service that could destroy value rather than merely
 * fail to record it: Stripe does not guarantee event ordering, so an `expired`
 * arriving after a `paid` must not un-pay a real payment.
 */
describe('PaymentsService.markSessionUnpaid', () => {
  let service: PaymentsService;
  let payments: {
    findBySessionId: jest.Mock;
    update: jest.Mock;
    findOpenSessionForBooking: jest.Mock;
  };
  let config: Record<string, string>;

  beforeEach(async () => {
    jest.clearAllMocks();
    config = { ...CONFIG };
    payments = {
      findBySessionId: jest.fn().mockResolvedValue({
        id: 'payment-1',
        status: 'created',
      }),
      update: jest.fn().mockResolvedValue({ id: 'payment-1' }),
      findOpenSessionForBooking: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: ConfigService,
          useValue: { get: (key: string) => config[key] },
        },
        { provide: PaymentRepository, useValue: payments },
        { provide: ProspectService, useValue: { findById: jest.fn() } },
        {
          provide: ConsultationBookingRepository,
          useValue: { findById: jest.fn(), findLatestForProspect: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('marks an expired session expired', async () => {
    await service.markSessionUnpaid('cs_1', 'expired');
    expect(payments.update).toHaveBeenCalledWith('payment-1', {
      status: 'expired',
    });
  });

  it('marks a failed async payment failed', async () => {
    await service.markSessionUnpaid('cs_1', 'failed');
    expect(payments.update).toHaveBeenCalledWith('payment-1', {
      status: 'failed',
    });
  });

  it('REFUSES to un-pay a payment that already settled', async () => {
    // Stripe does not guarantee ordering. Without this, a late `expired` for a
    // session that was paid first would rewrite a real payment as abandoned —
    // and the money would be gone from our records while still being in the
    // customer's statement.
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
    payments.findBySessionId.mockResolvedValue({
      id: 'payment-1',
      status: 'paid',
    });

    await service.markSessionUnpaid('cs_1', 'expired');
    expect(payments.update).not.toHaveBeenCalled();
  });

  it('returns null when there is no local row', async () => {
    payments.findBySessionId.mockResolvedValue(null);
    expect(await service.markSessionUnpaid('cs_unknown', 'expired')).toBeNull();
  });
});
