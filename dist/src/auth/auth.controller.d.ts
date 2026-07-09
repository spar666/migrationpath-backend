import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(dto: SignUpDto): Promise<{
        user: {
            id: string;
            email: string;
            full_name: string;
            role: import("./roles.enum").app_role;
            created_at: Date;
            updated_at: Date;
        };
        access_token: string;
    }>;
    signIn(dto: SignInDto): Promise<{
        user: {
            id: string;
            email: string;
            full_name: string;
            role: import("./roles.enum").app_role;
            created_at: Date;
            updated_at: Date;
        };
        access_token: string;
    }>;
    signOut(): Promise<{
        message: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            full_name: string;
            role: import("./roles.enum").app_role;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    requestPasswordReset(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    confirmPasswordReset(dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        full_name: string;
        role: import("./roles.enum").app_role;
        created_at: Date;
        updated_at: Date;
    }>;
}
