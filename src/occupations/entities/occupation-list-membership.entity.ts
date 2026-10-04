import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Occupation } from './occupation.entity';
import { SkilledList } from '../constants/visa-mapping';
@Entity('occupation_list_memberships')
export class OccupationListMembership {
  @PrimaryColumn({ name: 'occupation_code', length: 6 }) occupation_code: string;
  @PrimaryColumn({ name: 'list_code', type: 'varchar' }) list_code: SkilledList;
  @Column({ type: 'text', nullable: true }) source_note: string | null;
  @Column({ type: 'date', nullable: true }) effective_date: string | null;
  @ManyToOne(() => Occupation, occupation => occupation.listMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'occupation_code', referencedColumnName: 'anzsco_code' }) occupation: Occupation;
}
