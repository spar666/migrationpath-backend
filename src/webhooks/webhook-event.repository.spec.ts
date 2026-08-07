import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebhookEventRepository } from './webhook-event.repository';
import { WebhookEvent } from './entities/webhook-event.entity';

/**
 * The claim, which is the whole of the system's crash recovery.
 *
 * Providers retry because deliveries fail; the retry is only worth anything if
 * we are willing to run the handler again. Getting the boundary wrong is
 * expensive in one direction and merely wasteful in the other:
 *
 *   too strict — a process that died mid-handler is never retried, and a
 *                payment stays taken with its booking unconfirmed forever.
 *   too loose  — a handler runs twice concurrently, which the handlers are
 *                written to tolerate.
 *
 * So the tests pin the exact SQL predicate rather than the method's return
 * value alone: the decision is made by Postgres, and a change to that WHERE
 * clause is a change to whether money can go missing.
 */
describe('WebhookEventRepository.claim', () => {
  let repository: WebhookEventRepository;
  let query: jest.Mock;

  beforeEach(async () => {
    query = jest.fn().mockResolvedValue([{ id: 'evt-row-1', attempts: 1 }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookEventRepository,
        {
          provide: getRepositoryToken(WebhookEvent),
          useValue: { query, metadata: { columns: [] } },
        },
      ],
    }).compile();

    repository = module.get(WebhookEventRepository);
  });

  const claim = () =>
    repository.claim('stripe', 'evt_1', 'checkout.session.completed', {});

  it('claims an event nobody has seen', async () => {
    const claimed = await claim();
    expect(claimed).not.toBeNull();
  });

  it('refuses anything already processed', async () => {
    // The one case that must never re-run: the work is done, and repeating it
    // would re-alert the agent for a booking confirmed days ago.
    await claim();
    const [sql] = query.mock.calls[0];
    expect(String(sql)).toMatch(/status\s*<>\s*'processed'/);
  });

  it('leaves an in-flight claim alone', async () => {
    // A fresh claim means another worker is mid-handler right now. The lease
    // comparison is what distinguishes that from an abandoned one.
    await claim();
    const [sql, params] = query.mock.calls[0];

    expect(String(sql)).toMatch(/claimed_at\s*<\s*\$5/);
    // The lease boundary is passed as a real timestamp, not computed in SQL,
    // so the window is explicit and testable.
    expect(params[4]).toBeInstanceOf(Date);
    expect(params[4].getTime()).toBeLessThan(Date.now());
  });

  it('RE-CLAIMS an abandoned one — this is the crash recovery', async () => {
    // A row stuck in `received` with a stale lease is a handler that died.
    // Discarding the provider's retry here is what used to leave payments
    // taken and bookings unconfirmed.
    await claim();
    const [sql] = query.mock.calls[0];

    expect(String(sql)).toMatch(/ON CONFLICT .* DO UPDATE/is);
    expect(String(sql)).toMatch(/claimed_at IS NULL/);
  });

  it('counts attempts, so a repeatedly failing event is visible', async () => {
    await claim();
    const [sql] = query.mock.calls[0];
    expect(String(sql)).toMatch(/attempts\s*=\s*webhook_events\.attempts \+ 1/);
  });

  it('returns null when the database declines the claim', async () => {
    // No row back means the WHERE clause rejected it: processed, or in flight.
    query.mockResolvedValue([]);
    expect(await claim()).toBeNull();
  });

  it('decides in ONE statement, so concurrent deliveries cannot both win', async () => {
    // A read followed by a write loses when a provider sends the same event
    // twice in the same millisecond, which Stripe does.
    await claim();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('rethrows rather than processing on an unusable claim', async () => {
    // Without a guarantee of idempotency we must not run the handler at all,
    // or a retry storm multiplies the side effects.
    jest.spyOn(repository['logger'], 'error').mockImplementation(() => {});
    query.mockRejectedValue(new Error('db down'));

    await expect(claim()).rejects.toThrow('db down');
  });
});
