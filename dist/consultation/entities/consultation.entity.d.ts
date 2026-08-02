import { User } from '../../auth/entities/user.entity';
export declare class ConsultationQuestionnaire {
    id: string;
    user_id: string;
    responses: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    user: User;
}
export type ConsultationBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export declare class ConsultationBooking {
    id: string;
    user_id?: string | null;
    prospect_id?: string | null;
    status: ConsultationBookingStatus;
    scheduler_provider?: string;
    scheduler_event_id?: string | null;
    scheduler_invitee_id?: string | null;
    scheduled_at?: Date | null;
    scheduled_end_at?: Date | null;
    join_url?: string | null;
    reschedule_url?: string | null;
    cancel_url?: string | null;
    cancellation_reason?: string | null;
    strategy_delivery: string;
    created_at: Date;
    updated_at: Date;
    user?: User;
}
