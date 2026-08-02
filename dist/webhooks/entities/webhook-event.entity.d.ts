export type WebhookProvider = 'calendly' | 'stripe' | 'docusign';
export type WebhookProcessingStatus = 'received' | 'processed' | 'failed';
export declare class WebhookEvent {
    id: string;
    provider: WebhookProvider;
    external_id: string;
    event_type: string;
    status: WebhookProcessingStatus;
    payload?: Record<string, any>;
    error?: string | null;
    processed_at?: Date | null;
    created_at: Date;
}
