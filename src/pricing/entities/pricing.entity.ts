import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('service_packages')
export class ServicePackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  package_name: string;

  @Column()
  visa_subclass: string;

  @Column({
    type: 'enum',
    enum: ['student', 'skilled', 'family', 'employer'],
  })
  category: 'student' | 'skilled' | 'family' | 'employer';

  @Column('decimal', { precision: 10, scale: 2 })
  professional_fees: number;

  @Column('decimal', { precision: 10, scale: 2 })
  government_charges: number;

  @Column('decimal', { precision: 10, scale: 2 })
  estimated_extras: number;

  @Column('text', { array: true })
  inclusions: string[];

  @Column({ default: true })
  is_active: boolean;

  @Column('int', { default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('user_quotes')
export class UserQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  package_id: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'accepted', 'expired'],
    default: 'draft',
  })
  status: 'draft' | 'sent' | 'accepted' | 'expired';

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  custom_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  expires_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ServicePackage)
  @JoinColumn({ name: 'package_id' })
  package: ServicePackage;
}
