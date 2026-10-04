import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';
@Entity('commercial_config')
export class CommercialConfig {
  @PrimaryColumn({ name: 'config_key' }) configKey: string;
  @Column({ name: 'numeric_value', type: 'double precision' }) numericValue: number;
  @Column() label: string;
  @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
}
