import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Admin-managed regional-area postcode bands. Replaces the hard-coded arrays in
 * PostcodeValidatorService so the designated-regional-area instrument can be
 * kept current without a code deploy. Stored as ranges (matching the source
 * data), classified METRO / CATEGORY_2 / CATEGORY_3.
 */
@Entity('regional_postcode_bands')
export class RegionalPostcodeBand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  region: string;

  @Index('idx_regional_band_category')
  @Column({ type: 'varchar' })
  category: string; // METRO | CATEGORY_2 | CATEGORY_3

  @Column({ name: 'postcode_from', type: 'int' })
  postcodeFrom: number;

  @Column({ name: 'postcode_to', type: 'int' })
  postcodeTo: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate: string | null;

  @Column({ name: 'source_note', type: 'text', nullable: true })
  sourceNote: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
