import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

/**
 * The `document_reminders` column is intentionally not mapped here. It was a
 * preference for the document vault, which migration
 * `1785000000000-AddPointsValueAndRemoveUserDocuments` dropped — there is
 * nothing left to remind anyone about. The column still exists in the database
 * (removals in this pass are code-only); it is simply no longer addressable.
 */
@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ default: true })
  email_updates: boolean;

  @Column({ default: true })
  invitation_alerts: boolean;

  @Column({ default: true })
  news_alerts: boolean;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
