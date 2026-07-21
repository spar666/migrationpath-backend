import type { LeadSource } from '../entities/lead.entity';
export declare class CreateLeadDto {
    full_name: string;
    email: string;
    phone?: string;
    visa_type?: string;
    message?: string;
    package_id?: string;
    source?: LeadSource;
    website?: string;
}
