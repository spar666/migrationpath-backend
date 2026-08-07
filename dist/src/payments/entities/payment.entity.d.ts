export type PaymentPurpose = 'consultation' | 'service_fee' | 'other';
export type PaymentStatus = 'created' | 'paid' | 'failed' | 'expired' | 'refunded' | 'duplicate';
export declare class Payment {
    id: string;
    prospect_id: string;
    booking_id?: string | null;
    purpose: PaymentPurpose;
    status: PaymentStatus;
    provider: string;
    provider_session_id?: string | null;
    provider_payment_intent_id?: string | null;
    amount_cents?: number | null;
    currency: string;
    paid_at?: Date | null;
    provider_metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
