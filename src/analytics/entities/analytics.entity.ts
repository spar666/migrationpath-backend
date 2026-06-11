import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('invitation_trends')
export class InvitationTrend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  anzsco_code: string;

  @Column()
  round_date: Date;

  @Column()
  subclass: string;

  @Column('int')
  min_points_invited: number;

  @Column('int')
  invitations_issued: number;

  @Column({ nullable: true })
  source_url: string;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('state_nominations')
export class StateNomination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
  })
  state_code: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';

  @Column()
  anzsco_code: string;

  @Column({ default: true })
  is_open: boolean;

  @Column({
    type: 'enum',
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  })
  priority_level: 'high' | 'medium' | 'low';

  @Column({ type: 'text', nullable: true })
  additional_requirements: string;

  @Column()
  last_updated: Date;

  @CreateDateColumn()
  created_at: Date;
}
