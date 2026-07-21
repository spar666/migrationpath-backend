import { User } from '../../auth/entities/user.entity';
export declare class ConsultationQuestionnaire {
    id: string;
    user_id: string;
    responses: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    user: User;
}
export declare class ConsultationBooking {
    id: string;
    user_id: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    strategy_delivery: string;
    created_at: Date;
    updated_at: Date;
    user: User;
}
