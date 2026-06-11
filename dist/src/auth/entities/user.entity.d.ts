import { app_role } from '../roles.enum';
export declare class User {
    id: string;
    email: string;
    password: string;
    full_name: string;
    role: app_role;
    created_at: Date;
    updated_at: Date;
}
