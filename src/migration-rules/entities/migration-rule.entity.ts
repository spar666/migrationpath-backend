import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('migration_rules')
export class MigrationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'persona_type' })
  persona_type: string;

  @Column({ name: 'document_name' })
  document_name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_mandatory', default: true })
  is_mandatory: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
