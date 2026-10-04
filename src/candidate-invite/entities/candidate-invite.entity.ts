import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('candidate_invites')
export class CandidateInvite {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column('uuid') business_prospect_id: string;
  @Column({ length: 160 }) candidate_name: string;
  @Column({ length: 160 }) candidate_email: string;
  @Column({ length: 100, nullable: true }) candidate_nationality?: string;
  @Index({ unique: true }) @Column({ length: 64 }) token_hash: string;
  @Column({ length: 20, default: 'pending' }) status:
    'pending' | 'accepted' | 'expired';
  @Column({ type: 'timestamptz' }) expires_at: Date;
  @Column('uuid', { nullable: true }) applicant_prospect_id?: string;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
