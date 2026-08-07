import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sponsor } from './sponsor.entity';

export type NominationStatus =
  'draft' | 'open' | 'matched' | 'lodged' | 'withdrawn';

/**
 * A role a sponsor wants to fill: occupation + subclass + salary + location.
 *
 * `applicant_prospect_id` is the join that closes the two-sided funnel — it
 * is null until an agent matches an applicant-party prospect to this role.
 */
@Entity('nominations')
export class Nomination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  sponsor_id: string;

  /** ANZSCO occupation code, e.g. '261313'. */
  @Column({ length: 12, nullable: true })
  occupation_code?: string;

  @Column({ nullable: true })
  occupation_name?: string;

  /**
   * The employer's own title for the role, which routinely differs from the
   * ANZSCO occupation it is nominated under. Both matter: the ANZSCO decides
   * eligibility, the internal title is what appears on the contract.
   */
  @Column({ nullable: true })
  position_title?: string;

  /** Target subclass as a string: '482', '186', '494'. */
  @Column({ length: 8, nullable: true })
  subclass?: string;

  /** Annual guaranteed earnings in AUD, excluding superannuation. */
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  annual_salary?: number;

  /**
   * The salary band as chosen. `annual_salary` carries the band's lower bound
   * so the engine has a figure to test, but the band is what was actually said.
   */
  @Column({ length: 40, nullable: true })
  salary_band?: string;

  /** What the candidate earns today, banded. Informs the market-rate argument. */
  @Column({ length: 40, nullable: true })
  candidate_current_pay_band?: string;

  @Column({ nullable: true })
  work_state?: string;

  @Column({ nullable: true })
  work_postcode?: string;

  /** True if the work location is a designated regional area. */
  @Column({ type: 'boolean', nullable: true })
  is_regional?: boolean | null;

  /** Whether Labour Market Testing has been completed, as declared. */
  @Column({ type: 'boolean', nullable: true })
  lmt_completed?: boolean | null;

  @Column({ length: 16, default: 'draft' })
  status: NominationStatus;

  /**
   * The applicant-party prospect matched to this role. Null = unmatched.
   * Set by the agent (see §9 "Next"), never by the public questionnaire.
   */
  @Index()
  @Column('uuid', { nullable: true })
  applicant_prospect_id?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  raw_answers?: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Sponsor, (sponsor) => sponsor.nominations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sponsor_id' })
  sponsor: Sponsor;
}
