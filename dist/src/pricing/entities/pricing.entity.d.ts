import { User } from '../../auth/entities/user.entity';
export declare class ServicePackage {
    id: string;
    package_name: string;
    visa_subclass: string;
    category: 'student' | 'skilled' | 'family' | 'employer';
    professional_fees: number;
    government_charges: number;
    estimated_extras: number;
    inclusions: string[];
    is_active: boolean;
    display_order: number;
    created_at: Date;
    updated_at: Date;
}
export declare class UserQuote {
    id: string;
    user_id: string;
    package_id: string;
    status: 'draft' | 'sent' | 'accepted' | 'expired';
    total_amount: number;
    custom_notes: string;
    created_at: Date;
    expires_at: Date;
    user: User;
    package: ServicePackage;
}
