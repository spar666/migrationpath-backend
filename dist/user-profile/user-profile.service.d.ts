import { Repository } from 'typeorm';
import { ProfileRepository } from './profile.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { User } from '../auth/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginatedResult } from '../common/repositories/base.repository';
export declare class UserProfileService {
    private readonly profileRepo;
    private readonly notificationsService;
    private readonly userRepository;
    constructor(profileRepo: ProfileRepository, notificationsService: NotificationsService, userRepository: Repository<User>);
    getMyProfile(userId: string): Promise<Profile>;
    updateMyProfile(userId: string, dto: UpdateProfileDto): Promise<Profile>;
    getAllProfiles(page: number, limit: number): Promise<PaginatedResult<Profile>>;
    getUserById(id: string): Promise<Profile>;
    getPreferences(userId: string): Promise<{
        notificationEmail: boolean;
        notificationSMS: boolean;
        marketingEmails: boolean;
        theme: "light";
        language: string;
    }>;
    updatePreferences(userId: string, dto: any): Promise<{
        notificationEmail: boolean;
        notificationSMS: boolean;
        marketingEmails: boolean;
        theme: "light";
        language: string;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    updateAvatar(userId: string, avatarUrl: string): Promise<{
        url: string;
    }>;
    deleteAccount(userId: string, confirmPassword?: string): Promise<{
        success: boolean;
    }>;
}
