import { User } from '../../auth/entities/user.entity';
export declare class UserPoints {
    id: string;
    user_id: string;
    persona_type: string;
    total_points: number;
    breakdown: Record<string, any>;
    selections: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    user: User;
}
