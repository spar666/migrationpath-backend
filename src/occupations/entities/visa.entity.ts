import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { VisaResidencyType } from '../constants/visa-mapping';
import { OccupationVisa } from './occupation-visa.entity';

/**
 * Reference/lookup table for Australian skilled visa subclasses.
 * Seeded from VISA_CATALOGUE by migration 1788000000000.
 */
@Entity('visas')
export class Visa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The visa subclass number as a string (e.g. '189', '482'). Stored as text so
   * codes are never coerced to numbers and to leave room for lettered variants.
   */
  @Index('idx_visas_subclass_number', { unique: true })
  @Column({ name: 'subclass_number', type: 'varchar', length: 16 })
  subclass_number: string;

  @Column({ name: 'stream_title', type: 'varchar' })
  stream_title: string;

  @Column({
    name: 'residency_type',
    type: 'enum',
    enum: VisaResidencyType,
  })
  residency_type: VisaResidencyType;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => OccupationVisa, (occupationVisa) => occupationVisa.visa)
  occupationVisas: OccupationVisa[];
}
