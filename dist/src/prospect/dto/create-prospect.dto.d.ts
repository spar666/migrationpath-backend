export declare class CreateProspectDto {
    party?: 'applicant' | 'business';
    full_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    source?: string;
    visa_interest?: string;
    consent_given: boolean;
    consent_text?: string;
    answers?: Record<string, any>;
}
