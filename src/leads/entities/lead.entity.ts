import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type LeadSource = 'quote_slideover' | 'quote_page' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  visa_type: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  // Optional link to a specific service package, when the lead came from
  // the /quote page rather than the header quick-quote slide-over.
  @Column('uuid', { nullable: true })
  package_id: string;

  @Column({ default: 'other' })
  source: LeadSource;

  @Column({
    type: 'enum',
    enum: ['new', 'contacted', 'converted', 'archived'],
    default: 'new',
  })
  status: LeadStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
