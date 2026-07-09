import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
