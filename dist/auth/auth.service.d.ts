import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { app_role } from './roles.enum';
import { Profile } from '../user-profile/entities/profile.entity';
import { NotificationPreference } from '../notifications/entities/notification.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly profileRepository;
    private readonly preferencesRepository;
    private readonly jwtService;
    private readonly logger;
    constructor(userRepository: Repository<User>, profileRepository: Repository<Profile>, preferencesRepository: Repository<NotificationPreference>, jwtService: JwtService);
    signUp(dto: SignUpDto): Promise<{
        user: {
            id: string;
            email: string;
            full_name: string;
            role: app_role;
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
            role: app_role;
            created_at: Date;
            updated_at: Date;
        };
        access_token: string;
    }>;
    private provisionUserRecords;
    signOut(): Promise<{
        message: string;
    }>;
    getUser(accessToken: string): Promise<{
        id: string;
        email: string;
        full_name: string;
        role: app_role;
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
            role: app_role;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    requestPasswordReset(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    confirmPasswordReset(_token: string, _newPassword: string): Promise<void>;
    private sanitizeUser;
}
