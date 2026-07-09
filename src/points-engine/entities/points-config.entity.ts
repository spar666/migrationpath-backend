import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('points_config')
export class PointsConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  visa_group: string;

  @Index()
  @Column()
  category: string;

  @Column({ nullable: true })
  attribute_name: string;

  @Column({ type: 'int' })
  points_value: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
