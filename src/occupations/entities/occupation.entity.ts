import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('occupations_list')
export class Occupation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  occupation_name: string;

  @Column({ unique: true })
  anzsco_code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  assessing_authority: string;

  @Column('int', { default: 0 })
  points_value: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OccupationThreshold, (threshold) => threshold.occupation)
  thresholds: OccupationThreshold[];
}

@Entity('occupation_thresholds')
export class OccupationThreshold {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  occupation_id: string;

  @Column()
  state_code: string;

  @Column('int')
  min_points: number;

  @Column({ default: true })
  is_available: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Occupation, (occupation) => occupation.thresholds)
  @JoinColumn({ name: 'occupation_id' })
  occupation: Occupation;
}
