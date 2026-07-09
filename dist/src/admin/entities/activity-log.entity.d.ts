import { User } from '../../auth/entities/user.entity';
import { Profile } from '../../user-profile/entities/profile.entity';
export declare class ActivityLog {
    id: string;
    user_id: string;
    action: string;
    metadata: Record<string, any>;
    created_at: Date;
    user: User;
    profile: Profile;
}
