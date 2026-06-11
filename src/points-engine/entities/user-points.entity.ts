import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('user_points')
export class UserPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  user_id: string;

  @Column({ nullable: true })
  persona_type: string;

  @Column({ type: 'int', default: 0 })
  total_points: number;

  @Column({ type: 'jsonb', nullable: true })
  breakdown: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  selections: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
