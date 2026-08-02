import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

export type WebhookProvider = 'calendly' | 'stripe' | 'docusign';

export type WebhookProcessingStatus = 'received' | 'processed' | 'failed';

/**
 * Every inbound webhook, recorded before it is acted on.
 *
 * This table does two jobs:
 *
 *  1. IDEMPOTENCY. Providers retry. Stripe retries for days on a non-2xx, and
 *     Calendly will resend. Without a record of what we have already handled,
 *     a retry double-confirms a booking and double-alerts the agent. The
 *     unique constraint on (provider, external_id) is the guard — it is
 *     enforced by the database, not by a check-then-act in application code,
 *     because check-then-act loses under concurrent delivery.
 *
 *  2. FORENSICS. When a booking is in a state nobody can explain, the raw
 *     payloads in arrival order are the only way to reconstruct what the
 *     provider actually told us.
 */
@Entity('webhook_events')
@Unique('UQ_webhook_provider_external_id', ['provider', 'external_id'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 24 })
  provider: WebhookProvider;

  /**
   * The provider's own event id (Stripe `evt_...`, Calendly's payload uri).
   * This is the idempotency key.
   */
  @Column()
  external_id: string;

  /** e.g. 'checkout.session.completed', 'invitee.created'. */
  @Index()
  @Column({ length: 64 })
  event_type: string;

  @Column({ length: 16, default: 'received' })
  status: WebhookProcessingStatus;

  /** Full payload as received. */
  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, any>;

  /** Populated when status = 'failed', so failures are visible without logs. */
  @Column({ type: 'text', nullable: true })
  error?: string | null;

  /** Set once handling succeeds, for lag measurement. */
  @Column({ type: 'timestamptz', nullable: true })
  processed_at?: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
