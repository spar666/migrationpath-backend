import { User } from '../../auth/entities/user.entity';
export type ProgressStep = 'search' | 'view_details' | 'points_calculator' | 'visa_recommendation' | 'completed';
export declare class UserProgress {
    id: string;
    user_id: string;
    title: string;
    current_step: ProgressStep;
    anzsco_code: string;
    target_visa: string;
    calculated_points: number;
    data: Record<string, any>;
    is_completed: boolean;
    created_at: Date;
    updated_at: Date;
    user: User;
}
