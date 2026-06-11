import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type ProgressStep =
  | 'search'
  | 'view_details'
  | 'points_calculator'
  | 'visa_recommendation'
  | 'completed';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ nullable: true })
  title: string;

  /**
   * The step the user is currently at in the journey.
   * e.g. 'search' → 'view_details' → 'points_calculator' → 'completed'
   */
  @Column({ default: 'search' })
  current_step: ProgressStep;

  /** ANZSCO occupation code the user is researching */
  @Column({ nullable: true })
  anzsco_code: string;

  /** Visa subclass the user is targeting */
  @Column({ nullable: true })
  target_visa: string;

  /** Cached points score from the calculator */
  @Column({ type: 'int', nullable: true })
  calculated_points: number;

  /**
   * Flexible JSONB blob to store step-specific data
   * (search filters, viewed course IDs, calculator answers, etc.)
   */
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ default: false })
  is_completed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
