import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * One row per legislative data domain. Drives the admin freshness badges:
 * an admin records when they last verified a domain against the source
 * instrument, and the UI colour-codes how overdue each one is.
 */
@Entity('data_source_meta')
export class DataSourceMeta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_data_source_domain', { unique: true })
  @Column({ type: 'varchar' })
  domain: string;

  @Column({ type: 'varchar' })
  label: string;

  @Column({ name: 'last_verified_at', type: 'timestamptz', nullable: true })
  lastVerifiedAt: Date | null;

  @Column({ name: 'review_interval_days', type: 'int', default: 90 })
  reviewIntervalDays: number;

  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'admin_route', type: 'varchar', nullable: true })
  adminRoute: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
