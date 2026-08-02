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
jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: { create: (...a: unknown[]) => sessionsCreate(...a) },
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
  };
  let prospects: { findById: jest.Mock };
  let bookings: { findById: jest.Mock; findLatestForProspect: jest.Mock };
  let config: Record<string, string>;

  async function build() {
    payments = {
      create: jest.fn().mockResolvedValue({ id: 'payment-1' }),
      update: jest.fn().mockResolvedValue({}),
      hasPaidFor: jest.fn().mockResolvedValue(false),
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

    it('marks the row failed when Stripe rejects the call', async () => {
      sessionsCreate.mockRejectedValue(new Error('card_declined'));

      await expect(
        service.createConsultationCheckout({
          prospect_id: 'prospect-1',
        }),
      ).rejects.toThrow();
      expect(payments.update).toHaveBeenCalledWith('payment-1', {
        status: 'failed',
      });
    });

    it('treats a session with no URL as a failure', async () => {
      sessionsCreate.mockResolvedValue({ id: 'cs_1', url: null });

      await expect(
        service.createConsultationCheckout({
          prospect_id: 'prospect-1',
        }),
      ).rejects.toThrow();
      expect(payments.update).toHaveBeenCalledWith('payment-1', {
        status: 'failed',
      });
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
