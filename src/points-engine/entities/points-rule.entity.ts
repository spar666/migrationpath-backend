import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('points_rules')
export class PointsRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  visa_group: string;

  @Index()
  @Column()
  category: string;

  @Column({ nullable: true })
  sub_category: string;

  @Column({ nullable: true })
  attribute_label: string;

  @Column({ type: 'int', nullable: true })
  min_value: number;

  @Column({ type: 'int', nullable: true })
  max_value: number;

  @Column({ type: 'int' })
  points_value: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
