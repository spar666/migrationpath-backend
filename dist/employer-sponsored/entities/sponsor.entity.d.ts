import { Nomination } from './nomination.entity';
export type SponsorStatus = 'prospective' | 'approved' | 'lapsed' | 'refused' | 'unknown';
export declare class Sponsor {
    id: string;
    prospect_id: string;
    legal_name: string;
    trading_name?: string;
    abn?: string;
    industry?: string;
    employee_count?: number;
    years_trading?: number;
    state?: string;
    postcode?: string;
    sponsorship_status: SponsorStatus;
    has_adverse_information?: boolean | null;
    meets_training_obligations?: boolean | null;
    raw_answers?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    nominations: Nomination[];
}
