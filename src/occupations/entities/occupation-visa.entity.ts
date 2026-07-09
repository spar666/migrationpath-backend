import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Occupation } from './occupation.entity';
import { Visa } from './visa.entity';

/**
 * Per-visa caveats attached to an occupation<->visa link. Modelled as structured
 * JSON so strict, machine-readable thresholds can live alongside free-text notes
 * (e.g. income floors, business-size limits, regional conditions).
 */
export interface OccupationVisaCaveats {
  incomeThreshold?: number;
  minBusinessSize?: number;
  regionalOnly?: boolean;
  notes?: string;
  [key: string]: unknown;
}

/**
 * Relational junction linking an occupation (by its ANZSCO code primary key) to
 * an eligible visa. Replaces the previous flat multi-select list tags.
 *
 * Note on the FK column name: because the occupations primary key is now
 * `anzsco_code` (per spec), the "occupation_id" role is fulfilled by
 * `occupation_anzsco_code`, which references occupations_list(anzsco_code)
 * directly. The visa side keeps a conventional uuid FK.
 */
@Entity('occupation_visas')
@Unique('UQ_occupation_visa', ['occupation_anzsco_code', 'visa_id'])
export class OccupationVisa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_occupation_visas_anzsco')
  @Column({ name: 'occupation_anzsco_code', type: 'varchar', length: 6 })
  occupation_anzsco_code: string;

  @Index('idx_occupation_visas_visa_id')
  @Column({ name: 'visa_id', type: 'uuid' })
  visa_id: string;

  /**
   * Optional per-link caveats (income thresholds, business-size limits, etc.).
   * jsonb for indexability; nullable because most links carry none.
   */
  @Column({ type: 'jsonb', nullable: true })
  caveats: OccupationVisaCaveats | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Occupation, (occupation) => occupation.occupationVisas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'occupation_anzsco_code',
    referencedColumnName: 'anzsco_code',
  })
  occupation: Occupation;

  @ManyToOne(() => Visa, (visa) => visa.occupationVisas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'visa_id' })
  visa: Visa;
}
