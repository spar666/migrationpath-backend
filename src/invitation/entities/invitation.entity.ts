import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Fully dormant — nothing in the application reads or writes this table.
 *
 * The "Live Invitations" ticker and its manual-entry admin screen were removed
 * first: the rows were hand-typed, labelled LIVE, and had no reliable source
 * behind them (the government's machine-readable SkillSelect feed has been dead
 * since 2020). At that point `search.service.ts` still read the table to
 * annotate results with `visa_subclass`, `age_points` and `priority`, so the
 * entity stayed.
 *
 * That reader has since gone too, with the courses module — those annotations
 * hung off course rows. The entity is kept only so the table stays mapped and
 * its existing rows are not stranded by a schema TypeORM no longer knows about.
 * Do not build on it: any real invitation data needs a real source first.
 */
@Entity('invitation_feed')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  occupation: string;

  @Column()
  visa_class: string;

  @Column()
  state: string;

  @Column('int')
  points: number;

  @Column('int')
  days_ago: number;

  @Column({ default: false })
  priority: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
