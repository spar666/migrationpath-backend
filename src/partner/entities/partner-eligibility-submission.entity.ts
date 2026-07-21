import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * A completed Partner Visa eligibility quiz. The structured columns cover the
 * fields used for triage/follow-up; the full answer set is kept as jsonb so
 * nothing the visitor told us is lost.
 */
@Entity('partner_eligibility_submissions')
export class PartnerEligibilitySubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'applicant_first_name', type: 'varchar' })
  applicantFirstName: string;

  @Column({ name: 'sponsor_first_name', type: 'varchar' })
  sponsorFirstName: string;

  @Column({ name: 'completed_by', type: 'varchar' })
  completedBy: string;

  @Index('idx_partner_eligibility_email')
  @Column({ type: 'varchar' })
  email: string;

  @Column({ name: 'applicant_country', type: 'varchar' })
  applicantCountry: string;

  @Column({ name: 'relationship_status', type: 'varchar' })
  relationshipStatus: string;

  // ---- Computed outcome ----
  @Index('idx_partner_eligibility_outcome')
  @Column({ type: 'varchar' })
  outcome: string;

  @Column({ type: 'varchar' })
  summary: string;

  @Column({ type: 'varchar' })
  effort: string;

  @Column({ name: 'high_risk', type: 'boolean', default: false })
  highRisk: boolean;

  @Column({ name: 'becoming_eligible', type: 'boolean', default: false })
  becomingEligible: boolean;

  // ---- Full answer snapshot ----
  @Column({ type: 'jsonb' })
  answers: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
