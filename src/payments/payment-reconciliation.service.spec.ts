import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentReconciliationService } from './payment-reconciliation.service';
import { PaymentRepository } from './payment.repository';
import { PaymentsService } from './payments.service';

/**
 * The safety net for payments the webhook never delivered.
 *
 * A session left in `created` is ambiguous from our side: the visitor may have
 * abandoned checkout, or they may have paid and the webhook may have been lost.
 * Writing rows off on age alone silently discards the second case, which is a
 * customer charged for a consultation nobody booked.
 *
 * So the tests here are mostly about the sweep refusing to guess, and about it
 * surviving the things that go wrong while it runs.
 */
describe('PaymentReconciliationService', () => {
  let service: PaymentReconciliationService;
  let payments: { findStaleOpenSessions: jest.Mock };
  let paymentsService: { reconcileSession: jest.Mock };

  const stale = (id: string) => ({
    id,
    provider_session_id: `cs_${id}`,
    status: 'created',
  });

  beforeEach(async () => {
    payments = { findStaleOpenSessions: jest.fn().mockResolvedValue([]) };
    paymentsService = { reconcileSession: jest.fn().mockResolvedValue('open') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentReconciliationService,
        // Sweep off: onModuleInit must not start a timer during tests.
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: PaymentRepository, useValue: payments },
        { provide: PaymentsService, useValue: paymentsService },
      ],
    }).compile();

    service = module.get(PaymentReconciliationService);
  });

  it('checks every stale session against Stripe', async () => {
    payments.findStaleOpenSessions.mockResolvedValue([stale('a'), stale('b')]);

    const result = await service.reconcile();

    expect(paymentsService.reconcileSession).toHaveBeenCalledTimes(2);
    expect(result.checked).toBe(2);
  });

  it('counts the payments it recovered', async () => {
    // The number that matters. Every one is a customer who paid and whose
    // booking was never confirmed.
    payments.findStaleOpenSessions.mockResolvedValue([stale('a'), stale('b')]);
    paymentsService.reconcileSession
      .mockResolvedValueOnce('recovered')
      .mockResolvedValueOnce('expired');

    const result = await service.reconcile();

    expect(result.recovered).toBe(1);
    expect(result.expired).toBe(1);
  });

  it('keeps going when one row fails', async () => {
    // The next row may be the payment that actually needs recovering, so one
    // bad session must not end the sweep.
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
    payments.findStaleOpenSessions.mockResolvedValue([
      stale('a'),
      stale('b'),
      stale('c'),
    ]);
    paymentsService.reconcileSession
      .mockRejectedValueOnce(new Error('stripe down'))
      .mockResolvedValue('recovered');

    const result = await service.reconcile();

    expect(paymentsService.reconcileSession).toHaveBeenCalledTimes(3);
    expect(result.recovered).toBe(2);
  });

  it('does not run two sweeps at once', async () => {
    // One Stripe round trip per row makes this slow, and an overlapping tick
    // would double the calls to reach the same conclusions.
    payments.findStaleOpenSessions.mockResolvedValue([stale('a')]);
    let release: () => void = () => {};
    paymentsService.reconcileSession.mockImplementation(
      () => new Promise<string>((resolve) => (release = () => resolve('open'))),
    );

    const first = service.reconcile();
    const second = await service.reconcile();

    expect(second.checked).toBe(0);
    release();
    await first;
  });

  it('is runnable again once a sweep finishes', async () => {
    // The overlap guard must not latch — a sweep that threw would otherwise
    // disable reconciliation for the lifetime of the process.
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
    payments.findStaleOpenSessions.mockRejectedValueOnce(new Error('db down'));

    await expect(service.reconcile()).rejects.toThrow('db down');

    payments.findStaleOpenSessions.mockResolvedValue([stale('a')]);
    const result = await service.reconcile();
    expect(result.checked).toBe(1);
  });

  it('stays off unless explicitly enabled', async () => {
    // Every instance running its own sweep is the same work several times over
    // against a rate-limited API.
    service.onModuleInit();
    expect(service['timer']).toBeUndefined();
  });

  it('skips a row with no session id', async () => {
    payments.findStaleOpenSessions.mockResolvedValue([
      { id: 'a', provider_session_id: null, status: 'created' },
    ]);

    await service.reconcile();
    expect(paymentsService.reconcileSession).not.toHaveBeenCalled();
  });
});
