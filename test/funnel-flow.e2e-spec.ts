import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';

import request from 'supertest';
import { createHmac } from 'crypto';

import { createInMemoryRepository } from './in-memory-repository';

// --- The funnel's real modules, wired the way app.module wires them ---
import { ProspectController } from '../src/prospect/prospect.controller';
import { ProspectService } from '../src/prospect/prospect.service';
import { ProspectRepository } from '../src/prospect/prospect.repository';
import { ProspectSummaryRepository } from '../src/prospect/prospect-summary.repository';
import { ProspectSummaryService } from '../src/prospect/prospect-summary.service';
import { ProspectNotifierService } from '../src/prospect/prospect-notifier.service';
import { Prospect } from '../src/prospect/entities/prospect.entity';
import { ProspectSummary } from '../src/prospect/entities/prospect-summary.entity';

import { PreScreenController } from '../src/pre-screen/pre-screen.controller';
import { PreScreenService } from '../src/pre-screen/pre-screen.service';

import { EmployerSponsoredEngine } from '../src/employer-sponsored/employer-sponsored.engine';
import { SponsorRepository } from '../src/employer-sponsored/sponsor.repository';
import { NominationRepository } from '../src/employer-sponsored/nomination.repository';
import { Sponsor } from '../src/employer-sponsored/entities/sponsor.entity';
import { Nomination } from '../src/employer-sponsored/entities/nomination.entity';

import { PaymentsController } from '../src/payments/payments.controller';
import { PaymentsService } from '../src/payments/payments.service';
import { PaymentRepository } from '../src/payments/payment.repository';
import { Payment } from '../src/payments/entities/payment.entity';

import { WebhooksService } from '../src/webhooks/webhooks.service';
import { WebhookEventRepository } from '../src/webhooks/webhook-event.repository';
import { CalendlyWebhookController } from '../src/webhooks/calendly-webhook.controller';
import { WebhookEvent } from '../src/webhooks/entities/webhook-event.entity';

import { ConsultationBookingRepository } from '../src/consultation/consultation.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { ConsultationBooking } from '../src/consultation/entities/consultation.entity';

/**
 * The funnel, driven over HTTP against the real application.
 *
 * Real: controllers, routing, the global ValidationPipe, DTO validation and
 * whitelisting, guards, the prospect/payments/webhooks services, the
 * employer-sponsored eligibility engine, and the human_ref generator.
 *
 * Faked: the SQL layer (an in-memory Repository) and Stripe's SDK. Nothing
 * else.
 *
 * The distinction matters. Unit specs already prove each service in isolation;
 * what they cannot catch is wiring — a DTO that strips a field before the
 * engine sees it, a route that answers on a different path than the frontend
 * calls, a guard on the wrong method, a service reading a property the layer
 * below never set. That class of bug only shows up when a request travels the
 * whole way, which is what this file does.
 */

const CALENDLY_KEY = 'calendly-test-signing-key';

const CONFIG: Record<string, unknown> = {
  // Registering the real JwtStrategy is what lets the admin routes answer 401
  // rather than 500. Worth the extra wiring: an admin route that 500s instead
  // of rejecting is still unguarded in every way that matters.
  'jwt.secret': 'functional-test-secret',
  'integrations.calendly.signingKey': CALENDLY_KEY,
  'integrations.stripe.secretKey': 'sk_test_functional',
  'integrations.stripe.webhookSecret': 'whsec_functional',
  'integrations.stripe.consultPriceId': 'price_functional',
  'integrations.stripe.successUrl': 'https://app.example/consult/confirmed',
  'integrations.stripe.cancelUrl': 'https://app.example/consult/book',
};

// Stripe's SDK is the one external dependency we cannot exercise. Only the two
// entry points the funnel uses are stubbed.
const sessionsCreate = jest.fn();
jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: { create: (...a: unknown[]) => sessionsCreate(...a) },
    },
    webhooks: {
      // Signature verification itself is unit-tested; here we only need the
      // handler path beyond it.
      constructEvent: (body: Buffer) => JSON.parse(body.toString('utf8')),
    },
  })),
);

function calendlySignature(body: string): string {
  const t = Math.floor(Date.now() / 1000);
  const v1 = createHmac('sha256', CALENDLY_KEY)
    .update(`${t}.${body}`)
    .digest('hex');
  return `t=${t},v1=${v1}`;
}

describe('Lead-gen funnel — functional flow', () => {
  let app: INestApplication;
  let repos: Record<string, ReturnType<typeof createInMemoryRepository>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    sessionsCreate.mockResolvedValue({
      id: 'cs_test_functional',
      url: 'https://checkout.stripe.com/c/pay/cs_test_functional',
      amount_total: 15000,
      currency: 'aud',
    });

    repos = {
      prospect: createInMemoryRepository({ unique: ['human_ref'] }),
      summary: createInMemoryRepository(),
      sponsor: createInMemoryRepository(),
      nomination: createInMemoryRepository(),
      payment: createInMemoryRepository(),
      webhookEvent: createInMemoryRepository({ unique: ['external_id'] }),
      booking: createInMemoryRepository({ unique: ['scheduler_event_id'] }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
      ],
      controllers: [
        PreScreenController,
        ProspectController,
        PaymentsController,
        CalendlyWebhookController,
      ],
      providers: [
        PreScreenService,
        ProspectService,
        ProspectRepository,
        ProspectSummaryRepository,
        ProspectSummaryService,
        ProspectNotifierService,
        EmployerSponsoredEngine,
        SponsorRepository,
        NominationRepository,
        PaymentsService,
        PaymentRepository,
        WebhooksService,
        WebhookEventRepository,
        ConsultationBookingRepository,
        JwtStrategy,
        { provide: getRepositoryToken(Prospect), useValue: repos.prospect },
        {
          provide: getRepositoryToken(ProspectSummary),
          useValue: repos.summary,
        },
        { provide: getRepositoryToken(Sponsor), useValue: repos.sponsor },
        { provide: getRepositoryToken(Nomination), useValue: repos.nomination },
        { provide: getRepositoryToken(Payment), useValue: repos.payment },
        {
          provide: getRepositoryToken(WebhookEvent),
          useValue: repos.webhookEvent,
        },
        {
          provide: getRepositoryToken(ConsultationBooking),
          useValue: repos.booking,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({ get: (key: string) => CONFIG[key] })
      .compile();

    app = moduleRef.createNestApplication({ rawBody: true });

    // The same pipe main.ts installs — so DTO whitelisting and transformation
    // behave here exactly as they do in production.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  const applicantSubmission = {
    party: 'applicant',
    contact: {
      full_name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+61400000000',
      consent_given: true,
      consent_text: 'the notice shown on screen',
    },
    applicant: {
      age: 32,
      occupation_code: '261313',
      occupation_name: 'Software Engineer',
      years_experience: 8,
      english_overall: 7.5,
      english_lowest_band: 7,
      has_skills_assessment: true,
      onshore: false,
      has_health_or_character_concern: false,
    },
    sponsoring_employer: { legal_name: 'Acme Pty Ltd', state: 'VIC' },
    offered_role: {
      occupation_code: '261313',
      occupation_name: 'Software Engineer',
      subclass: '482',
      annual_salary: 120000,
      work_state: 'VIC',
    },
    raw_answers: { full_name: 'Ada Lovelace', age: '32' },
    source: 'pre_screen_applicant',
  };

  // NOT async: supertest's Test object is itself thenable, and wrapping it in a
  // promise loses the chainable .expect().
  function preScreen(body: object = applicantSubmission) {
    return request(app.getHttpServer()).post('/api/v1/pre-screen').send(body);
  }

  // =========================================================================

  describe('step 1 — the pre-screen', () => {
    it('accepts a complete applicant submission and returns a live verdict', async () => {
      const response = await preScreen().expect(201);
      const body = response.body.data ?? response.body;

      expect(body.prospect_id).toEqual(expect.any(String));
      expect(body.human_ref).toMatch(/^MP-[A-Z2-9]{6}$/);
      expect(typeof body.statutory_eligible).toBe('boolean');
      expect(typeof body.client_fit).toBe('boolean');
      expect(typeof body.can_book).toBe('boolean');
      expect(Array.isArray(body.next_steps)).toBe(true);
    });

    it('persists the prospect with both gate flags', async () => {
      await preScreen().expect(201);

      expect(repos.prospect.rows).toHaveLength(1);
      const stored = repos.prospect.rows[0];
      expect(stored.stage).toBe('pre_screened');
      expect(stored.email).toBe('ada@example.com');
      expect(stored).toHaveProperty('statutory_eligible');
      expect(stored).toHaveProperty('client_fit');
    });

    it('records consent verbatim, with a timestamp', async () => {
      await preScreen().expect(201);
      const stored = repos.prospect.rows[0];

      expect(stored.consent_given).toBe(true);
      expect(stored.consent_text).toBe('the notice shown on screen');
      expect(stored.consent_at).toBeInstanceOf(Date);
    });

    it('writes the agent summary in the same request', async () => {
      // The summary is what the agent reads before the call. If capture and
      // summary can come apart, the alert deep-links to an empty page.
      await preScreen().expect(201);
      expect(repos.summary.rows.length).toBeGreaterThan(0);
    });

    it('rejects a submission without consent', async () => {
      await preScreen({
        ...applicantSubmission,
        contact: { ...applicantSubmission.contact, consent_given: false },
      }).expect(400);

      expect(repos.prospect.rows).toHaveLength(0);
    });

    it('rejects a malformed email at the DTO boundary', async () => {
      // Proves the global ValidationPipe is actually mounted — a unit test on
      // the service could never tell.
      await preScreen({
        ...applicantSubmission,
        contact: { ...applicantSubmission.contact, email: 'not-an-email' },
      }).expect(400);
    });

    it('strips unknown fields rather than storing them', async () => {
      await preScreen({
        ...applicantSubmission,
        contact: { ...applicantSubmission.contact, is_admin: true },
      }).expect(201);

      expect(repos.prospect.rows[0].is_admin).toBeUndefined();
    });

    it('gives two submissions two distinct references', async () => {
      const first = await preScreen().expect(201);
      const second = await preScreen({
        ...applicantSubmission,
        contact: { ...applicantSubmission.contact, email: 'grace@example.com' },
      }).expect(201);

      const refA = (first.body.data ?? first.body).human_ref;
      const refB = (second.body.data ?? second.body).human_ref;
      expect(refA).not.toBe(refB);
    });

    it('keeps an ineligible person as a lead', async () => {
      // Sparse answers: whatever the engine decides, the record must exist.
      await preScreen({
        party: 'applicant',
        contact: {
          full_name: 'Sparse Person',
          email: 'sparse@example.com',
          consent_given: true,
        },
        applicant: { age: 55 },
      }).expect(201);

      expect(repos.prospect.rows).toHaveLength(1);
    });

    it('handles a business submission and its sponsor', async () => {
      const response = await preScreen({
        party: 'business',
        contact: {
          full_name: 'Grace Hopper',
          email: 'grace@acme.example',
          consent_given: true,
        },
        business: {
          sponsor: {
            legal_name: 'Acme Pty Ltd',
            abn: '11222333444',
            years_trading: 12,
            state: 'NSW',
            sponsorship_status: 'approved',
          },
          nomination: {
            occupation_name: 'Chef',
            annual_salary: 78000,
            work_state: 'NSW',
            subclass: '482',
          },
        },
      }).expect(201);

      const body = response.body.data ?? response.body;
      expect(body.human_ref).toMatch(/^MP-/);
      expect(repos.prospect.rows[0].party).toBe('business');
    });
  });

  // =========================================================================

  describe('step 2 — reading your own status', () => {
    let prospectId: string;
    let humanRef: string;

    beforeEach(async () => {
      const response = await preScreen().expect(201);
      const body = response.body.data ?? response.body;
      prospectId = body.prospect_id;
      humanRef = body.human_ref;
    });

    it('returns status when the reference matches', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/prospects/${prospectId}/status`)
        .query({ ref: humanRef })
        .expect(200);

      const body = response.body.data ?? response.body;
      expect(body.human_ref).toBe(humanRef);
      expect(body.consult_confirmed).toBe(false);
      expect(body.booking).toBeNull();
    });

    it('404s on the right id with the wrong reference', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/prospects/${prospectId}/status`)
        .query({ ref: 'MP-WRONG1' })
        .expect(404);
    });

    it('404s with no reference at all', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/prospects/${prospectId}/status`)
        .expect(404);
    });

    it('never leaks contact details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/prospects/${prospectId}/status`)
        .query({ ref: humanRef })
        .expect(200);

      const serialised = JSON.stringify(response.body);
      expect(serialised).not.toContain('ada@example.com');
      expect(serialised).not.toContain('Ada Lovelace');
      expect(serialised).not.toContain('+61400000000');
    });

    it('keeps the agent prep view behind auth', async () => {
      // The public status route and the admin route differ by one path
      // segment. Proving the guard is on the right one is exactly the kind of
      // thing only a routed test catches.
      await request(app.getHttpServer())
        .get(`/api/v1/prospects/${prospectId}`)
        .expect(401);
    });

    it('keeps the prospect list behind auth', async () => {
      await request(app.getHttpServer()).get('/api/v1/prospects').expect(401);
    });
  });

  // =========================================================================

  describe('step 3 — booking a slot', () => {
    let prospectId: string;
    let humanRef: string;

    beforeEach(async () => {
      const response = await preScreen().expect(201);
      const body = response.body.data ?? response.body;
      prospectId = body.prospect_id;
      humanRef = body.human_ref;
    });

    function calendlyEvent(
      prospect: string,
      uri = 'https://api.calendly.com/invitees/1',
    ) {
      return {
        event: 'invitee.created',
        payload: {
          uri,
          email: 'ada@example.com',
          name: 'Ada Lovelace',
          tracking: { utm_content: prospect },
          scheduled_event: {
            uri: 'https://api.calendly.com/events/1',
            start_time: '2026-08-01T02:00:00.000Z',
            end_time: '2026-08-01T02:45:00.000Z',
            location: { join_url: 'https://meet.example/abc' },
          },
        },
      };
    }

    function postCalendly(event: unknown) {
      const body = JSON.stringify(event);
      return request(app.getHttpServer())
        .post('/api/v1/webhooks/calendly')
        .set('calendly-webhook-signature', calendlySignature(body))
        .set('content-type', 'application/json')
        .send(body);
    }

    it('creates a PENDING booking from invitee.created', async () => {
      await postCalendly(calendlyEvent(prospectId)).expect(200);

      expect(repos.booking.rows).toHaveLength(1);
      expect(repos.booking.rows[0].status).toBe('pending');
      expect(repos.booking.rows[0].prospect_id).toBe(prospectId);
    });

    it('does NOT advance the prospect to booked before payment', async () => {
      await postCalendly(calendlyEvent(prospectId)).expect(200);

      const status = await request(app.getHttpServer())
        .get(`/api/v1/prospects/${prospectId}/status`)
        .query({ ref: humanRef })
        .expect(200);

      const body = status.body.data ?? status.body;
      expect(body.stage).toBe('pre_screened');
      expect(body.consult_confirmed).toBe(false);
      expect(body.booking.status).toBe('pending');
    });

    it('rejects an unsigned webhook', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/webhooks/calendly')
        .send(calendlyEvent(prospectId))
        .expect(401);

      expect(repos.booking.rows).toHaveLength(0);
    });

    it('rejects a badly signed webhook', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/webhooks/calendly')
        .set('calendly-webhook-signature', 't=1,v1=deadbeef')
        .send(calendlyEvent(prospectId))
        .expect(401);

      expect(repos.booking.rows).toHaveLength(0);
    });

    it('is idempotent — a redelivered event creates one booking', async () => {
      // Calendly retries. Two bookings for one slot would double-book the
      // agent's calendar and confuse the payment step.
      const event = calendlyEvent(prospectId);
      await postCalendly(event).expect(200);
      await postCalendly(event).expect(200);

      expect(repos.booking.rows).toHaveLength(1);
    });
  });

  // =========================================================================

  describe('step 4 — paying to confirm', () => {
    let prospectId: string;

    beforeEach(async () => {
      const response = await preScreen().expect(201);
      const body = response.body.data ?? response.body;
      prospectId = body.prospect_id;
      // humanRef not needed in this block — checkout keys off the id alone.

      repos.booking.seed({
        prospect_id: prospectId,
        status: 'pending',
        scheduler_event_id: 'https://api.calendly.com/invitees/1',
        scheduled_at: new Date('2026-08-01T02:00:00.000Z'),
      });
    });

    function checkout(body: Record<string, unknown>) {
      return request(app.getHttpServer())
        .post('/api/v1/payments/consultation/checkout')
        .send(body);
    }

    it('returns a checkout URL', async () => {
      const response = await checkout({ prospect_id: prospectId }).expect(201);
      const body = response.body.data ?? response.body;

      expect(body.checkout_url).toContain('checkout.stripe.com');
      expect(body.payment_id).toEqual(expect.any(String));
    });

    it('takes the price from config, never from the request', async () => {
      // The client sends an amount; it must be ignored entirely.
      await checkout({ prospect_id: prospectId, amount_cents: 1 }).expect(201);

      const [params] = sessionsCreate.mock.calls[0];
      expect(params.line_items).toEqual([
        { price: 'price_functional', quantity: 1 },
      ]);
      expect(repos.payment.rows[0].amount_cents).not.toBe(1);
    });

    it('writes the ledger row as created, not paid', async () => {
      await checkout({ prospect_id: prospectId }).expect(201);
      expect(repos.payment.rows).toHaveLength(1);
      expect(repos.payment.rows[0].status).not.toBe('paid');
    });

    it('refuses for an unknown prospect', async () => {
      await checkout({
        prospect_id: '00000000-0000-4000-8000-000000000000',
      }).expect(404);
    });

    it('refuses when no slot is held', async () => {
      repos.booking.rows.length = 0;
      await checkout({ prospect_id: prospectId }).expect(400);
    });
  });

  // =========================================================================

  describe('step 5 — the whole journey', () => {
    it('runs pre-screen to confirmed booking end to end', async () => {
      // 1. Pre-screen.
      const screened = await preScreen().expect(201);
      const { prospect_id: prospectId, human_ref: humanRef } =
        screened.body.data ?? screened.body;

      // 2. Book a slot via the Calendly webhook.
      const event = {
        event: 'invitee.created',
        payload: {
          uri: 'https://api.calendly.com/invitees/journey',
          email: 'ada@example.com',
          tracking: { utm_content: prospectId },
          scheduled_event: {
            uri: 'https://api.calendly.com/events/journey',
            start_time: '2026-08-01T02:00:00.000Z',
            end_time: '2026-08-01T02:45:00.000Z',
            location: { join_url: 'https://meet.example/journey' },
          },
        },
      };
      const body = JSON.stringify(event);
      await request(app.getHttpServer())
        .post('/api/v1/webhooks/calendly')
        .set('calendly-webhook-signature', calendlySignature(body))
        .set('content-type', 'application/json')
        .send(body)
        .expect(200);

      // Held but unpaid — this is the agent's follow-up queue.
      let status = await request(app.getHttpServer())
        .get(`/api/v1/prospects/${prospectId}/status`)
        .query({ ref: humanRef })
        .expect(200);
      expect((status.body.data ?? status.body).booking.status).toBe('pending');
      expect((status.body.data ?? status.body).consult_confirmed).toBe(false);

      // 3. Start checkout.
      const checkoutResponse = await request(app.getHttpServer())
        .post('/api/v1/payments/consultation/checkout')
        .send({ prospect_id: prospectId })
        .expect(201);
      const paymentId = (checkoutResponse.body.data ?? checkoutResponse.body)
        .payment_id;

      // 4. Stripe confirms. Driven through the service rather than the
      //    controller, because signature verification is the SDK's job and is
      //    unit-tested separately.
      const webhooks = app.get(WebhooksService);
      await webhooks.processOnce(
        'stripe',
        'evt_journey_1',
        'checkout.session.completed',
        {},
        () =>
          webhooks.handleStripeCheckoutCompleted({
            id: 'cs_test_functional',
            amount_total: 15000,
            currency: 'aud',
            metadata: {
              prospect_id: prospectId,
              payment_id: paymentId,
              purpose: 'consultation',
            },
          }),
      );

      // 5. The prospect's own page can now see a confirmed booking.
      status = await request(app.getHttpServer())
        .get(`/api/v1/prospects/${prospectId}/status`)
        .query({ ref: humanRef })
        .expect(200);

      const finalBody = status.body.data ?? status.body;
      expect(finalBody.consult_confirmed).toBe(true);
      expect(finalBody.stage).toBe('booked');
      expect(finalBody.booking.status).toBe('confirmed');
      expect(finalBody.booking.join_url).toBe('https://meet.example/journey');
    });

    it('does not double-confirm when Stripe redelivers the event', async () => {
      const screened = await preScreen().expect(201);
      const { prospect_id: prospectId } = screened.body.data ?? screened.body;

      repos.booking.seed({ prospect_id: prospectId, status: 'pending' });

      const checkoutResponse = await request(app.getHttpServer())
        .post('/api/v1/payments/consultation/checkout')
        .send({ prospect_id: prospectId })
        .expect(201);
      const paymentId = (checkoutResponse.body.data ?? checkoutResponse.body)
        .payment_id;

      const webhooks = app.get(WebhooksService);
      const session = {
        id: 'cs_test_functional',
        amount_total: 15000,
        currency: 'aud',
        metadata: { prospect_id: prospectId, payment_id: paymentId },
      };

      const first = await webhooks.processOnce(
        'stripe',
        'evt_dupe',
        'checkout.session.completed',
        {},
        () => webhooks.handleStripeCheckoutCompleted(session),
      );
      const second = await webhooks.processOnce(
        'stripe',
        'evt_dupe',
        'checkout.session.completed',
        {},
        () => webhooks.handleStripeCheckoutCompleted(session),
      );

      expect(first).toBe(true);
      expect(second).toBe(false); // claimed already — handler never ran
      expect(
        repos.payment.rows.filter((p) => p.status === 'paid'),
      ).toHaveLength(1);
    });
  });
});
