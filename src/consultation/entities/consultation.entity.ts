import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('consultation_questionnaire')
export class ConsultationQuestionnaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'jsonb' })
  responses: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

export type ConsultationBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

/**
 * A consultation slot.
 *
 * Two things changed here for the lead-gen funnel:
 *
 * 1. `user_id` is now NULLABLE. A prospect books before they have an account —
 *    the funnel is book-then-pay, and neither step requires a login. The
 *    booking hangs off `prospect_id` instead. `user_id` stays for bookings made
 *    by existing logged-in users.
 *
 * 2. Scheduler columns were added so a Calendly invitee maps onto this row.
 *
 * IMPORTANT — pending means UNPAID, and that is on purpose. A prospect who
 * picks a slot and then abandons checkout leaves a `pending` row behind. Those
 * rows are the agent's follow-up queue, not garbage: someone got far enough to
 * choose a time. Do not add a job that deletes them.
 */
@Entity('consultation_bookings')
export class ConsultationBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nullable: funnel bookings are made by anonymous prospects. */
  @Column('uuid', { nullable: true })
  user_id?: string | null;

  /** The funnel spine this booking belongs to. */
  @Index()
  @Column('uuid', { nullable: true })
  prospect_id?: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
  })
  status: ConsultationBookingStatus;

  // --- Scheduler (Calendly) ---

  /** 'calendly' today; the column exists so a swap isn't a migration. */
  @Column({ length: 32, nullable: true })
  scheduler_provider?: string;

  /** Calendly invitee URI — the idempotency key for invitee webhooks. */
  @Index({ unique: true })
  // Explicit `type` is required: the TS type is `string | null`, so
  // emitDecoratorMetadata emits design:type = Object and TypeORM cannot
  // infer a Postgres type from it.
  @Column({ type: 'varchar', nullable: true })
  scheduler_event_id?: string | null;

  /** Calendly scheduled_event URI. */
  @Column({ type: 'varchar', nullable: true })
  scheduler_invitee_id?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  scheduled_at?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  scheduled_end_at?: Date | null;

  /** Video conference link, when the event type provides one. */
  @Column({ type: 'text', nullable: true })
  join_url?: string | null;

  @Column({ type: 'text', nullable: true })
  reschedule_url?: string | null;

  @Column({ type: 'text', nullable: true })
  cancel_url?: string | null;

  @Column({ type: 'text', nullable: true })
  cancellation_reason?: string | null;

  @Column({ type: 'text', nullable: true })
  strategy_delivery: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
