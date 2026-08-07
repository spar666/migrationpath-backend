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

  /**
   * When this delivery was last picked up for processing.
   *
   * The lease that makes a crash survivable. A row sitting in `received` means
   * one of two things — a handler is running right now, or a handler died
   * partway through — and the two are indistinguishable from the row alone.
   * The timestamp separates them: recent means in flight, stale means abandoned
   * and safe to retry.
   *
   * Without it, `claim` refused every delivery it had already seen, so a crash
   * mid-handler meant Stripe's retries were all dropped: the payment was taken,
   * the booking never confirmed, and nothing in the system disagreed.
   */
  @Column({ type: 'timestamptz', nullable: true })
  claimed_at?: Date | null;

  /**
   * How many times we have started handling this delivery.
   *
   * Above one means something went wrong the first time. Worth surfacing:
   * a payment that needed three attempts to confirm is fine, and a payment
   * that has needed thirty is an outage nobody has noticed.
   */
  @Column({ type: 'int', default: 0 })
  attempts: number;

  @CreateDateColumn()
  created_at: Date;
}
