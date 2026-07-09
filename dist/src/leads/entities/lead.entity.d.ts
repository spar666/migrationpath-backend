export type LeadSource = 'quote_slideover' | 'quote_page' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';
export declare class Lead {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    visa_type: string;
    message: string;
    package_id: string;
    source: LeadSource;
    status: LeadStatus;
    created_at: Date;
    updated_at: Date;
}
