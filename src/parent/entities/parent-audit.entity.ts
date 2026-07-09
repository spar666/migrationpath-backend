import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('parent_audits')
export class ParentAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ---- Inputs ----
  @Column({ name: 'sponsor_status', type: 'varchar' })
  sponsorStatus: string;

  @Column({ name: 'sponsor_months_in_australia', type: 'int' })
  sponsorMonthsInAustralia: number;

  @Column({ name: 'total_children', type: 'int' })
  totalChildren: number;

  @Column({ name: 'children_in_australia', type: 'int' })
  childrenInAustralia: number;

  @Column({ name: 'children_in_largest_other_country', type: 'int', default: 0 })
  childrenInLargestOtherCountry: number;

  @Column({ name: 'sponsor_taxable_income', type: 'int' })
  sponsorTaxableIncome: number;

  @Column({ name: 'parent_age', type: 'int' })
  parentAge: number;

  // ---- Outputs ----
  @Index('idx_parent_audits_eligible')
  @Column({ name: 'is_eligible', type: 'boolean' })
  isEligible: boolean;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ name: 'balance_percentage', type: 'int' })
  balancePercentage: number;

  @Column({ name: 'balance_pass', type: 'boolean' })
  balancePass: boolean;

  @Column({ name: 'sponsor_check_pass', type: 'boolean' })
  sponsorCheckPass: boolean;

  @Column({ name: 'aos_meets_benchmark', type: 'boolean' })
  aosMeetsBenchmark: boolean;

  @Column({ name: 'requires_co_assurer', type: 'boolean' })
  requiresCoAssurer: boolean;

  @Column({ name: 'predicted_subclass', type: 'varchar' })
  predictedSubclass: string;

  @Column({ type: 'jsonb', nullable: true })
  recommendations: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
