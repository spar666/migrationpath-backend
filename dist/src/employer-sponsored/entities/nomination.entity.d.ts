import { Sponsor } from './sponsor.entity';
export type NominationStatus = 'draft' | 'open' | 'matched' | 'lodged' | 'withdrawn';
export declare class Nomination {
    id: string;
    sponsor_id: string;
    occupation_code?: string;
    occupation_name?: string;
    position_title?: string;
    subclass?: string;
    annual_salary?: number;
    salary_band?: string;
    candidate_current_pay_band?: string;
    work_state?: string;
    work_postcode?: string;
    is_regional?: boolean | null;
    lmt_completed?: boolean | null;
    status: NominationStatus;
    applicant_prospect_id?: string | null;
    raw_answers?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    sponsor: Sponsor;
}
