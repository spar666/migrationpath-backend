import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type PaymentPurpose = 'consultation' | 'service_fee' | 'other';

/**
 * `duplicate` is not a state anything transitions into deliberately. It exists
 * so that a second `paid` row for the same consultation — which the unique
 * index now prevents, but which older data may contain — can be set aside
 * without being deleted. A payment row is evidence; two of them is something a
 * person needs to look at, not something a migration should quietly destroy.
 */
export type PaymentStatus =
  'created' | 'paid' | 'failed' | 'expired' | 'refunded' | 'duplicate';

/**
 * A payment attempt.
 *
 * This table is a LOCAL MIRROR of Stripe, not a ledger. Stripe is the source
 * of truth for money; this row exists so the funnel can answer "has this
 * prospect paid" without a round trip, and so the agent view has something to
 * show. Never compute a refund or a balance from this table.
 *
 * No card data is ever stored or handled here — checkout is hosted by Stripe,
 * which is what keeps PCI scope at its lightest (§7).
 */
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  prospect_id: string;

  /** The booking this payment confirms, when there is one. */
  @Column('uuid', { nullable: true })
  booking_id?: string | null;

  @Column({ length: 24, default: 'consultation' })
  purpose: PaymentPurpose;

  @Column({ length: 16, default: 'created' })
  status: PaymentStatus;

  @Column({ length: 16, default: 'stripe' })
  provider: string;

  /**
   * Stripe Checkout Session id. Unique because the webhook uses it to decide
   * whether it has already processed this session — Stripe retries deliveries
   * and will happily send checkout.session.completed more than once.
   */
  @Index({ unique: true })
  // Explicit `type` is required: the TS type is `string | null`, so
  // emitDecoratorMetadata emits design:type = Object and TypeORM cannot
  // infer a Postgres type from it.
  @Column({ type: 'varchar', nullable: true })
  provider_session_id?: string | null;

  @Column({ type: 'varchar', nullable: true })
  provider_payment_intent_id?: string | null;

  /**
   * Minor units (cents). Integer on purpose — floats and money do not mix,
   * and this must match what Stripe reports to the cent.
   */
  @Column({ type: 'int', nullable: true })
  amount_cents?: number | null;

  @Column({ length: 8, default: 'aud' })
  currency: string;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at?: Date | null;

  /** Trimmed provider payload, for reconciliation when something looks wrong. */
  @Column({ type: 'jsonb', nullable: true })
  provider_metadata?: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
