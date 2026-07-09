import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('partner_audits')
export class PartnerAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_partner_audits_location')
  @Column({ name: 'current_location', type: 'varchar' })
  currentLocation: string;

  // ---- Inputs (snapshot of the self-assessment) ----
  @Column({ name: 'joint_bank_accounts', type: 'boolean', default: false })
  jointBankAccounts: boolean;

  @Column({ name: 'joint_lease_or_mortgage', type: 'boolean', default: false })
  jointLeaseOrMortgage: boolean;

  @Column({ name: 'shared_utility_bills', type: 'boolean', default: false })
  sharedUtilityBills: boolean;

  @Column({ name: 'shared_domestic_bills', type: 'boolean', default: false })
  sharedDomesticBills: boolean;

  @Column({ name: 'joint_child_responsibility', type: 'boolean', default: false })
  jointChildResponsibility: boolean;

  @Column({ name: 'matching_address_history', type: 'boolean', default: false })
  matchingAddressHistory: boolean;

  @Column({ name: 'shared_travel_itineraries', type: 'boolean', default: false })
  sharedTravelItineraries: boolean;

  @Column({ name: 'form_888_count', type: 'int', default: 0 })
  form888Count: number;

  @Column({ name: 'joint_social_invitations', type: 'boolean', default: false })
  jointSocialInvitations: boolean;

  @Column({ name: 'lived_together_12_months', type: 'boolean', default: false })
  livedTogether12Months: boolean;

  @Column({ name: 'registered_relationship_bdm', type: 'boolean', default: false })
  registeredRelationshipBDM: boolean;

  // ---- Computed outputs (logged for analytics / follow-up) ----
  @Column({ name: 'overall_readiness', type: 'int' })
  overallReadiness: number;

  @Column({ name: 'financial_score', type: 'int' })
  financialScore: number;

  @Column({ name: 'household_score', type: 'int' })
  householdScore: number;

  @Column({ name: 'social_score', type: 'int' })
  socialScore: number;

  @Column({ name: 'commitment_score', type: 'int' })
  commitmentScore: number;

  @Column({ name: 'commitment_status', type: 'varchar' })
  commitmentStatus: string;

  @Column({ name: 'legislative_waiver_applied', type: 'boolean', default: false })
  legislativeWaiverApplied: boolean;

  @Column({ name: 'predicted_subclass', type: 'varchar' })
  predictedSubclass: string;

  @Column({ type: 'jsonb', nullable: true })
  recommendations: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
