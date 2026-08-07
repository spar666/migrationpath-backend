import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { WebhookEvent, WebhookProvider } from './entities/webhook-event.entity';
export declare class WebhookEventRepository extends BaseRepository<WebhookEvent> {
    private readonly webhookRepository;
    protected readonly logger: Logger;
    constructor(webhookRepository: Repository<WebhookEvent>);
    claim(provider: WebhookProvider, externalId: string, eventType: string, payload: Record<string, any>): Promise<WebhookEvent | null>;
    markProcessed(id: string): Promise<void>;
    markFailed(id: string, error: string): Promise<void>;
}
