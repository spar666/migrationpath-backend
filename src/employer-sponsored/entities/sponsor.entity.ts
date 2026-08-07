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
  'prospective' | 'approved' | 'lapsed' | 'refused' | 'unknown';

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

  @Column({ nullable: true })
  business_address?: string;

  /** Prior sponsorship activity, which changes the monitoring history to check. */
  @Column({ type: 'boolean', nullable: true })
  sponsored_last_5_years?: boolean | null;

  /**
   * Holds an approved Standard Business Sponsorship, as declared. Only asked of
   * a business that has sponsored before, so null means "not asked" rather than
   * "no" — `sponsorship_status` carries the engine's reading of it.
   */
  @Column({ type: 'boolean', nullable: true })
  is_standard_business_sponsor?: boolean | null;

  /** Banded turnover. Stored as the chosen label, not parsed to a figure. */
  @Column({ length: 40, nullable: true })
  annual_revenue_band?: string;

  /** Banded trading history. `years_trading` holds the derived lower bound. */
  @Column({ length: 40, nullable: true })
  years_operating_band?: string;

  @Column({ type: 'boolean', nullable: true })
  operates_only_in_australia?: boolean | null;

  /** Banded headcount. `employee_count` holds the derived lower bound. */
  @Column({ length: 40, nullable: true })
  employee_count_band?: string;

  @Column({ type: 'boolean', nullable: true })
  has_temporary_visa_employees?: boolean | null;

  @Column({ length: 60, nullable: true })
  referral_source?: string;

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
