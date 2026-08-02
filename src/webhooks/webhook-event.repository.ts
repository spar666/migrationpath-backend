import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import {
  WebhookEvent,
  WebhookProvider,
} from './entities/webhook-event.entity';

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
   * Returns the new row if this delivery is the first, or null if the event
   * has already been seen. The claim is an INSERT that relies on the unique
   * constraint — deliberately NOT a SELECT-then-INSERT, which races when a
   * provider delivers the same event twice within milliseconds (Stripe does).
   */
  async claim(
    provider: WebhookProvider,
    externalId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<WebhookEvent | null> {
    try {
      const result = await this.webhookRepository
        .createQueryBuilder()
        .insert()
        .into(WebhookEvent)
        .values({
          provider,
          external_id: externalId,
          event_type: eventType,
          payload,
          status: 'received',
        })
        .orIgnore() // ON CONFLICT DO NOTHING
        .returning('*')
        .execute();

      const row = result.raw?.[0];
      if (!row) {
        this.logger.log(
          `Duplicate ${provider} webhook ${externalId} (${eventType}) — already handled`,
        );
        return null;
      }
      return row as WebhookEvent;
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
