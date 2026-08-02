export type ProspectParty = 'applicant' | 'business';
export type ProspectStage = 'captured' | 'pre_screened' | 'booked' | 'consulted' | 'engaged' | 'disqualified';
export declare class Prospect {
    id: string;
    human_ref: string;
    party: ProspectParty;
    full_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    stage: ProspectStage;
    statutory_eligible?: boolean | null;
    client_fit?: boolean | null;
    source: string;
    visa_interest?: string;
    consent_given: boolean;
    consent_text?: string;
    consent_at?: Date;
    user_id?: string | null;
    sponsor_id?: string | null;
    agent_notes?: string;
    created_at: Date;
    updated_at: Date;
}
