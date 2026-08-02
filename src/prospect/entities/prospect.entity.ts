import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Which side of the funnel this record came in on. The splash screen forks
 * here: an individual applicant, or a business (employer) looking to sponsor.
 * Employer-sponsored migration has two sides and each gets its own prospect.
 */
export type ProspectParty = 'applicant' | 'business';

/**
 * Funnel position. This is deliberately coarse — it answers "what does the
 * agent do next", not "what has the system recorded". Payment/booking detail
 * lives on the booking and payment rows.
 *
 *   captured      — contact details only (a calculator, a partial form)
 *   pre_screened  — the eligibility engine has run; flags are set
 *   booked        — a consult slot is held AND the consult fee is paid
 *   consulted     — the consult happened (set by the agent)
 *   engaged       — signed client (Tier 3; not built yet)
 *   disqualified  — not proceeding (ineligible, bad fit, or went cold)
 */
export type ProspectStage =
  | 'captured'
  | 'pre_screened'
  | 'booked'
  | 'consulted'
  | 'engaged'
  | 'disqualified';

@Entity('prospects')
export class Prospect {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Short human-quotable reference (e.g. MP-7F3K9A). This is what the
   * prospect reads out on the phone and what the agent searches on — the
   * uuid is never spoken aloud. Generated in ProspectService.
   */
  @Index({ unique: true })
  @Column({ length: 16 })
  human_ref: string;

  @Column({ length: 16, default: 'applicant' })
  party: ProspectParty;

  @Column()
  full_name: string;

  @Index()
  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  /** Business party only. */
  @Column({ nullable: true })
  company_name?: string;

  @Index()
  @Column({ length: 24, default: 'captured' })
  stage: ProspectStage;

  /**
   * TWO INDEPENDENT FLAGS — do not collapse them into one "qualified" boolean.
   *
   * statutory_eligible: does this person/business meet the DHA rules as the
   *   engine currently understands them? A statement about the law.
   *
   * client_fit: is this someone we want to take on? Budget, timeline,
   *   complexity, onshore/offshore, whether we service this visa at all.
   *   A commercial decision — see computeClientFit() in the engine config.
   *
   * Both must be true before we offer a booking. null means not yet screened.
   */
  @Column({ type: 'boolean', nullable: true })
  statutory_eligible?: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  client_fit?: boolean | null;

  /** Which surface produced this record ('pre_screen', 'points_calculator', …). */
  @Column({ length: 48, default: 'unknown' })
  source: string;

  /** Best guess at the visa pathway at capture time. Refined at consult. */
  @Column({ nullable: true })
  visa_interest?: string;

  // --- Consent (see §7 — this is the record that we asked) ---

  @Column({ type: 'boolean', default: false })
  consent_given: boolean;

  /**
   * The exact collection-notice text shown at the time of consent, stored
   * verbatim. If the notice wording changes later, old records still show
   * what that person actually agreed to.
   */
  @Column({ type: 'text', nullable: true })
  consent_text?: string;

  @Column({ type: 'timestamp', nullable: true })
  consent_at?: Date;

  // --- Links ---

  /** Set if/when the prospect creates a platform account. */
  @Column('uuid', { nullable: true })
  user_id?: string | null;

  /** Business party: the sponsor record this prospect owns. */
  @Column('uuid', { nullable: true })
  sponsor_id?: string | null;

  @Column({ type: 'text', nullable: true })
  agent_notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
