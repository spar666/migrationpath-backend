import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

/**
 * Covers the new public lead-capture endpoint end to end: a real HTTP
 * request through the real ValidationPipe and TransformInterceptor,
 * against a real database connection (via AppModule's TypeOrmModule).
 *
 * Requires a reachable test database configured via the same env vars
 * main.ts reads (DB_HOST etc. — see .env.example). This was written but
 * never run in the working environment this was authored in (no network
 * access), so treat a first run as the actual verification, not a
 * formality — see DEVELOPER_HANDOFF.md.
 *
 * NOTE: this does not apply main.ts's global prefix ('api/v1') so routes
 * below are unprefixed, matching how AppModule is exercised directly in
 * the existing test/app.e2e-spec.ts. If you later add setGlobalPrefix to
 * this suite's setup, update the paths below to match.
 */
describe('Leads (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /leads', () => {
    it('accepts a valid public submission with no auth header', async () => {
      const response = await request(app.getHttpServer())
        .post('/leads')
        .send({
          full_name: 'E2E Test Lead',
          email: `e2e-lead-${Date.now()}@example.com`,
          phone: '+61400000000',
          visa_type: 'skilled-189',
          message: 'Submitted from the leads e2e suite.',
          source: 'quote_page',
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        full_name: 'E2E Test Lead',
        status: 'new',
        source: 'quote_page',
      });
      expect(response.body.data.id).toBeDefined();
    });

    it('rejects a submission missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/leads')
        .send({ full_name: 'Missing Email' })
        .expect(400);
    });

    it('rejects an invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/leads')
        .send({ full_name: 'Bad Email', email: 'not-an-email' })
        .expect(400);
    });

    it('silently discards a submission with the honeypot field filled', async () => {
      const email = `e2e-honeypot-${Date.now()}@example.com`;

      const response = await request(app.getHttpServer())
        .post('/leads')
        .send({
          full_name: 'Bot Submission',
          email,
          website: 'http://spam.example', // honeypot — real users never fill this
        })
        .expect(201); // looks like success to the caller — see leads.service.ts

      expect(response.body.data.id).toBe('discarded');

      // Confirm it was never actually persisted. Requires an admin token
      // in a real run — left as a manual follow-up rather than wired to a
      // real login here, to avoid this suite depending on seeded admin
      // credentials existing in the test database.
    });

    it('does not accept more than 5 submissions per minute from the same client', async () => {
      const attempts = Array.from({ length: 6 }, (_, i) =>
        request(app.getHttpServer())
          .post('/leads')
          .send({
            full_name: `Rate Limit Test ${i}`,
            email: `e2e-rate-${Date.now()}-${i}@example.com`,
          }),
      );

      const responses = await Promise.all(attempts);
      const statuses = responses.map((r) => r.status);

      // The 6th request in the same window should be throttled.
      expect(statuses.filter((s) => s === 429).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /leads', () => {
    it('rejects unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/leads').expect(401);
    });

    // An authenticated admin-flow test (sign up/sign in as an admin, then
    // GET /leads with the bearer token, and confirm a previously-created
    // lead appears) was intentionally left out of this file rather than
    // half-written. It needs either seeded admin credentials or a full
    // sign-up-as-admin flow in the test database, and guessing at that
    // setup here risked writing a test that looks complete but silently
    // tests the wrong thing. Worth adding once the test DB's admin-seeding
    // approach is confirmed.
  });
});
