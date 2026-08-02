import { ConfigService } from '@nestjs/config';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';
export declare class CalendlyWebhookController {
    private readonly webhooksService;
    private readonly configService;
    private readonly logger;
    constructor(webhooksService: WebhooksService, configService: ConfigService);
    handle(request: RawBodyRequest<Request>, signature?: string): Promise<{
        received: boolean;
        handled: boolean;
    }>;
}
