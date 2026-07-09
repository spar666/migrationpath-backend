import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SkilledList } from '../constants/visa-mapping';
import { OccupationVisa } from './occupation-visa.entity';

@Entity('occupations_list')
export class Occupation {
  /**
   * Primary key is the 6-digit ANZSCO code (per spec). The occupation is a
   * reference entity whose natural key is stable and meaningful, so it is a
   * better primary key than a surrogate uuid.
   */
  @PrimaryColumn({ name: 'anzsco_code', type: 'varchar', length: 6 })
  anzsco_code: string;

  /**
   * Retained surrogate uuid. It is no longer the primary key but is kept as a
   * secondary UNIQUE column so the pre-existing occupation_thresholds foreign
   * key (which references this column) continues to work without a data
   * migration of that table. Auto-populated by the DB default.
   */
  @Column({
    name: 'id',
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column({ name: 'occupation_name', type: 'varchar' })
  occupation_name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ name: 'assessing_authority', type: 'varchar', nullable: true })
  assessing_authority: string | null;

  @Column({ name: 'points_value', type: 'int', default: 0 })
  points_value: number;

  /**
   * The single skilled list that classifies this occupation. Drives visa
   * eligibility resolution via SKILLED_LIST_VISA_MATRIX. Nullable so an
   * occupation can exist before it has been classified.
   */
  @Column({
    name: 'primary_list',
    type: 'enum',
    enum: SkilledList,
    nullable: true,
  })
  primary_list: SkilledList | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => OccupationThreshold, (threshold) => threshold.occupation)
  thresholds: OccupationThreshold[];

  @OneToMany(
    () => OccupationVisa,
    (occupationVisa) => occupationVisa.occupation,
  )
  occupationVisas: OccupationVisa[];
}

@Entity('occupation_thresholds')
export class OccupationThreshold {
  @PrimaryColumn({ name: 'id', type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'occupation_id', type: 'uuid' })
  occupation_id: string;

  @Column({ name: 'state_code', type: 'varchar' })
  state_code: string;

  @Column({ name: 'min_points', type: 'int' })
  min_points: number;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  is_available: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  /**
   * References the retained surrogate uuid (occupations_list.id), not the new
   * anzsco_code primary key, so this relationship is unchanged by the PK swap.
   */
  @ManyToOne(() => Occupation, (occupation) => occupation.thresholds)
  @JoinColumn({ name: 'occupation_id', referencedColumnName: 'id' })
  occupation: Occupation;
}
