import type { ProgressStep } from '../entities/user-progress.entity';
export declare class SaveProgressDto {
    title?: string;
    current_step?: ProgressStep;
    anzsco_code?: string;
    target_visa?: string;
    calculated_points?: number;
    data?: Record<string, any>;
    is_completed?: boolean;
}
