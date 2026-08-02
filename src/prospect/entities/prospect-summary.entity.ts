import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Denormalised "agent prep" read-model — one row per prospect.
 *
 * Why a separate table rather than a join at read time: the agent opens this
 * ~60 seconds before a call and needs one query, and the shape is stitched
 * from five modules (prospect, engine result, sponsor/nomination, booking,
 * payment). Rebuilt by ProspectSummaryService.refresh(); never written to
 * directly by request handlers. Safe to drop and rebuild.
 */
@Entity('prospect_summary')
export class ProspectSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column('uuid')
  prospect_id: string;

  /** One-line "who is this and what do they want", for list views. */
  @Column({ type: 'text', nullable: true })
  headline?: string;

  /** { statutory_eligible, client_fit, reasons: [], blockers: [] } */
  @Column({ type: 'jsonb', nullable: true })
  eligibility?: Record<string, any>;

  /** Raw questionnaire answers as submitted — the homework for the call. */
  @Column({ type: 'jsonb', nullable: true })
  answers?: Record<string, any>;

  /** Full engine output, kept so a past decision can be explained later. */
  @Column({ type: 'jsonb', nullable: true })
  engine_result?: Record<string, any>;

  /** { sponsor: {...}, nominations: [...] } for business-party prospects. */
  @Column({ type: 'jsonb', nullable: true })
  sponsorship?: Record<string, any>;

  /** { booking_id, status, scheduled_at, join_url, reschedule_url } */
  @Column({ type: 'jsonb', nullable: true })
  booking?: Record<string, any>;

  /** { payment_id, status, amount_cents, currency, paid_at } */
  @Column({ type: 'jsonb', nullable: true })
  payment?: Record<string, any>;

  @UpdateDateColumn()
  refreshed_at: Date;
}
