import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Admin-editable legislative constants (thresholds, weights, benchmarks) that
 * were previously hard-coded in the audit engines. Distinct from points_config
 * (which holds the granular GSM points brackets): this table holds the scalar
 * policy values an admin needs to cross-check against Home Affairs / Centrelink
 * instruments and update when policy changes — without a code deploy.
 */
@Entity('policy_config')
export class PolicyConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_policy_config_key', { unique: true })
  @Column({ name: 'config_key', type: 'varchar' })
  configKey: string;

  @Column({ name: 'numeric_value', type: 'double precision' })
  numericValue: number;

  @Column({ type: 'varchar' })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index('idx_policy_config_category')
  @Column({ type: 'varchar' })
  category: string; // points | partner | parent

  @Column({ type: 'varchar', nullable: true })
  unit: string | null; // points | AUD | months | % | count | age

  /** Where the admin verified this value (instrument name / URL / note). */
  @Column({ name: 'source_note', type: 'text', nullable: true })
  sourceNote: string | null;

  /** When the value takes/took effect (for audit trail). */
  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
