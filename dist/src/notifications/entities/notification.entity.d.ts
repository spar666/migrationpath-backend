import { User } from '../../auth/entities/user.entity';
export declare class NotificationPreference {
    id: string;
    user_id: string;
    email_updates: boolean;
    invitation_alerts: boolean;
    document_reminders: boolean;
    news_alerts: boolean;
    updated_at: Date;
    user: User;
}
