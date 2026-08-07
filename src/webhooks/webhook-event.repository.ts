import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { WebhookEvent, WebhookProvider } from './entities/webhook-event.entity';

/**
 * How long a claim is honoured before the delivery is considered abandoned.
 *
 * Sized against the two failure modes it sits between. Too short and a slow
 * handler gets a second worker running alongside it; too long and a crashed
 * handler is not retried until after the provider has given up. Five minutes
 * comfortably exceeds any handler here (the longest does a handful of writes
 * and one Slack call) and sits well inside Stripe's multi-day retry schedule.
 */
const LEASE_MS = 5 * 60 * 1000;

@Injectable()
export class WebhookEventRepository extends BaseRepository<WebhookEvent> {
  protected readonly logger = new Logger(WebhookEventRepository.name);

  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookRepository: Repository<WebhookEvent>,
  ) {
    super(webhookRepository);
  }

  /**
   * Claim an event for processing.
   *
   * Returns a row if this delivery should be handled now, or null if it should
   * be skipped. Three cases, and the difference between them is what keeps a
   * crashed handler recoverable:
   *
   *   never seen  — claim it and handle it.
   *   processed   — skip. The work is done; a retry must not repeat it.
   *   in flight   — skip. Another worker holds a fresh lease.
   *   abandoned   — RE-CLAIM. Either the handler failed, or it was claimed and
   *                 never finished, which means the process died partway
   *                 through. Providers retry for exactly this reason and the
   *                 retry is the only thing that will finish the job.
   *
   * That last case used to be treated as a duplicate. The consequence was
   * specific and expensive: a crash between marking a payment paid and
   * confirming its booking left the consult paid for and unconfirmed forever,
   * with every one of Stripe's retries silently discarded.
   *
   * The whole thing is a single atomic statement. An INSERT ... ON CONFLICT DO
   * UPDATE with a WHERE clause lets Postgres decide who wins; a read followed
   * by a write loses when a provider delivers the same event twice in the same
   * millisecond, which Stripe does.
   */
  async claim(
    provider: WebhookProvider,
    externalId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<WebhookEvent | null> {
    try {
      // Long enough that a slow-but-live handler is not trampled, short enough
      // that a crash is retried while the provider is still sending.
      const staleAfter = new Date(Date.now() - LEASE_MS);

      const result = await this.webhookRepository.query(
        `
        INSERT INTO webhook_events
          (provider, external_id, event_type, payload, status, claimed_at, attempts)
        VALUES ($1, $2, $3, $4, 'received', now(), 1)
        ON CONFLICT (provider, external_id) DO UPDATE
          SET claimed_at = now(),
              attempts   = webhook_events.attempts + 1,
              status     = 'received'
          WHERE webhook_events.status <> 'processed'
            AND (webhook_events.claimed_at IS NULL
                 OR webhook_events.claimed_at < $5)
        RETURNING *
        `,
        [provider, externalId, eventType, payload, staleAfter],
      );

      const row = (result as WebhookEvent[])[0];

      // No row came back: the WHERE clause rejected the update, so this event
      // is either finished or being handled right now by someone else.
      if (!row) {
        this.logger.log(
          `Skipping ${provider} webhook ${externalId} (${eventType}) — ` +
            `already processed, or in flight elsewhere`,
        );
        return null;
      }

      if (row.attempts > 1) {
        this.logger.warn(
          `Re-processing ${provider} webhook ${externalId} (${eventType}), ` +
            `attempt ${row.attempts}. The previous attempt did not finish — ` +
            `usually a restart mid-handler.`,
        );
      }

      return row;
    } catch (error) {
      this.logger.error(
        `Failed to record ${provider} webhook ${externalId}: ${(error as Error).message}`,
      );
      // Do not swallow: if we cannot guarantee idempotency we must not
      // process, or a retry storm will multiply the side effects.
      throw error;
    }
  }

  async markProcessed(id: string): Promise<void> {
    await this.webhookRepository.update(id, {
      status: 'processed',
      processed_at: new Date(),
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.webhookRepository.update(id, {
      status: 'failed',
      error: error.slice(0, 2000),
    });
  }
}
