import { User } from '../../auth/entities/user.entity';
export declare class Profile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    nationality: string;
    current_visa: string;
    anzsco_code: string;
    is_admin: boolean;
    avatar_url: string;
    created_at: Date;
    updated_at: Date;
    user: User;
}
