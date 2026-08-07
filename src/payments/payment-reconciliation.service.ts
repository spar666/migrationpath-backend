import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentRepository } from './payment.repository';
import { PaymentsService, STALE_SESSION_MS } from './payments.service';

/**
 * Catches the payments the webhook did not.
 *
 * A checkout session sitting in `created` means one of two things, and from our
 * side of the wire they look identical: the visitor opened Stripe and walked
 * away, or they paid and the webhook never reached us. The first is ordinary
 * and the second is a customer charged for a consultation nobody has booked —
 * so the row cannot simply be written off on age.
 *
 * This asks Stripe which it was. Anything Stripe reports as paid is pushed
 * through the same confirmation path the webhook uses, and only genuinely
 * abandoned sessions are expired.
 *
 * It is a safety net, not the mechanism. The webhook remains how payments are
 * meant to confirm; this exists because webhooks are delivered over a network
 * that sometimes does not deliver.
 */
@Injectable()
export class PaymentReconciliationService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PaymentReconciliationService.name);
  private timer?: NodeJS.Timeout;
  /**
   * Guards against overlap. The sweep is slow — one Stripe round trip per row —
   * and a long run must not have the next tick start alongside it, doubling
   * the API calls to reach the same conclusions.
   */
  private running = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentsService: PaymentsService,
  ) {}

  onModuleInit(): void {
    // Off unless asked for. Every instance would otherwise run its own copy,
    // and on a multi-instance deploy that is the same work several times over
    // against a rate-limited API. Enable it on one instance, or leave it off
    // and drive `reconcile()` from the admin endpoint or an external cron.
    const enabled =
      this.configService.get<string>('PAYMENT_RECONCILIATION_ENABLED') ===
      'true';

    if (!enabled) {
      this.logger.log(
        'Payment reconciliation sweep is off. Set ' +
          'PAYMENT_RECONCILIATION_ENABLED=true on ONE instance to turn it on.',
      );
      return;
    }

    this.timer = setInterval(() => {
      void this.reconcile().catch((error) => {
        // Swallowed deliberately: an unhandled rejection out of a timer takes
        // the process down, and this is the component whose entire job is
        // recovering from things having gone wrong.
        this.logger.error(
          `Reconciliation sweep failed: ${(error as Error).message}`,
        );
      });
    }, SWEEP_INTERVAL_MS);

    // Does not hold the process open. Without this a shutdown waits on a timer
    // that has nothing useful to contribute to it.
    this.timer.unref?.();

    this.logger.log('Payment reconciliation sweep is on (hourly).');
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * One pass over the stale open sessions.
   *
   * Safe to call at any time, including concurrently with a webhook handling
   * the same payment: confirmation runs through handleStripeCheckoutCompleted,
   * which is idempotent, and the webhook event table means whichever arrives
   * second does no work twice.
   */
  async reconcile(): Promise<{
    checked: number;
    recovered: number;
    expired: number;
  }> {
    if (this.running) {
      this.logger.log(
        'Reconciliation already in progress — skipping this tick',
      );
      return { checked: 0, recovered: 0, expired: 0 };
    }
    this.running = true;

    try {
      const stale =
        await this.paymentRepository.findStaleOpenSessions(STALE_SESSION_MS);

      let recovered = 0;
      let expired = 0;

      for (const payment of stale) {
        if (!payment.provider_session_id) continue;

        try {
          const outcome = await this.paymentsService.reconcileSession(
            payment.id,
            payment.provider_session_id,
          );
          if (outcome === 'recovered') recovered += 1;
          if (outcome === 'expired') expired += 1;
        } catch (error) {
          // One bad row must not abandon the rest of the sweep — the next row
          // may be the payment that actually needs recovering.
          this.logger.error(
            `Could not reconcile payment ${payment.id}: ${(error as Error).message}`,
          );
        }
      }

      if (recovered > 0) {
        // Worth shouting about. Every one of these is a customer who was
        // charged and whose booking never confirmed, which means the webhook
        // is not arriving and the sweep is doing its job instead of its
        // insurance policy.
        this.logger.warn(
          `Reconciliation recovered ${recovered} paid payment(s) the webhook ` +
            `never delivered. Check the Stripe webhook endpoint is healthy.`,
        );
      }

      if (stale.length > 0) {
        this.logger.log(
          `Reconciliation: checked ${stale.length}, recovered ${recovered}, ` +
            `expired ${expired}`,
        );
      }

      return { checked: stale.length, recovered, expired };
    } finally {
      this.running = false;
    }
  }
}

/** Hourly. Frequent enough to catch a missed payment the same day, cheap enough to ignore. */
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;
