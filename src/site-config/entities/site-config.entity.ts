import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Stores the full site configuration as a single JSONB row.
 * The admin edits all page content (hero, CTA, benefits, footer)
 * through the SiteConfigEditor and saves it atomically.
 */
@Entity('site_config')
export class SiteConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_site_config_key', { unique: true })
  @Column({ name: 'config_key', type: 'varchar', default: "'site_config'" })
  configKey: string;

  @Column({ name: 'config_data', type: 'jsonb' })
  configData: Record<string, any>;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
