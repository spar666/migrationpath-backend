import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
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
    getUser(accessToken: string): Promise<{
        id: string;
        email: string;
        full_name: string;
        role: import("./roles.enum").app_role;
        created_at: Date;
        updated_at: Date;
    }>;
    validateUserById(id: string): Promise<User | null>;
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
    confirmPasswordReset(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private sanitizeUser;
}
