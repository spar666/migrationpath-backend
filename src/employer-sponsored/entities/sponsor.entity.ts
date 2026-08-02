import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Nomination } from './nomination.entity';

export type SponsorStatus =
  | 'prospective'
  | 'approved'
  | 'lapsed'
  | 'refused'
  | 'unknown';

/**
 * The employer side of an employer-sponsored application.
 *
 * A business-party prospect owns exactly one sponsor record; the sponsor owns
 * zero or more nominations (roles it wants to fill). An applicant-party
 * prospect attaches to a nomination once the agent matches the two sides —
 * that link is what closes the two-sided funnel.
 */
@Entity('sponsors')
export class Sponsor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The business prospect that created this sponsor. */
  @Index()
  @Column('uuid')
  prospect_id: string;

  @Column()
  legal_name: string;

  @Column({ nullable: true })
  trading_name?: string;

  /** Australian Business Number, digits only. Not validated as authoritative. */
  @Column({ length: 20, nullable: true })
  abn?: string;

  @Column({ nullable: true })
  industry?: string;

  /** Rough headcount band — drives complexity/fit, not eligibility. */
  @Column({ type: 'int', nullable: true })
  employee_count?: number;

  /** Years the business has been actively trading. */
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  years_trading?: number;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  postcode?: string;

  /** Existing Standard Business Sponsorship position, as declared. */
  @Column({ length: 24, default: 'unknown' })
  sponsorship_status: SponsorStatus;

  @Column({ type: 'boolean', nullable: true })
  has_adverse_information?: boolean | null;

  /** Whether the business meets its training/SAF obligations, as declared. */
  @Column({ type: 'boolean', nullable: true })
  meets_training_obligations?: boolean | null;

  @Column({ type: 'jsonb', nullable: true })
  raw_answers?: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Nomination, (nomination) => nomination.sponsor)
  nominations: Nomination[];
}
