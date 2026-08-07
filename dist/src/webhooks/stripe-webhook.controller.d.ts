import { ConfigService } from '@nestjs/config';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';
export declare class StripeWebhookController {
    private readonly webhooksService;
    private readonly configService;
    private readonly logger;
    private readonly stripe;
    constructor(webhooksService: WebhooksService, configService: ConfigService);
    private confirm;
    handle(request: RawBodyRequest<Request>, signature?: string): Promise<{
        received: boolean;
        handled: boolean;
    }>;
}
