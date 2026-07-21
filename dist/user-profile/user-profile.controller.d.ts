import { UserProfileService } from './user-profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
export declare class UserProfileController {
    private readonly userProfileService;
    constructor(userProfileService: UserProfileService);
    getMyProfile(user: AuthUser): Promise<import("./entities/profile.entity").Profile>;
    updateMyProfile(user: AuthUser, dto: UpdateProfileDto): Promise<import("./entities/profile.entity").Profile>;
    updateMyProfilePut(user: AuthUser, dto: UpdateProfileDto): Promise<import("./entities/profile.entity").Profile>;
    getPreferences(user: AuthUser): Promise<{
        notificationEmail: boolean;
        notificationSMS: boolean;
        marketingEmails: boolean;
        theme: "light";
        language: string;
    }>;
    updatePreferences(user: AuthUser, dto: any): Promise<{
        notificationEmail: boolean;
        notificationSMS: boolean;
        marketingEmails: boolean;
        theme: "light";
        language: string;
    }>;
    changePassword(user: AuthUser, dto: any): Promise<{
        success: boolean;
    }>;
    uploadAvatar(user: AuthUser, file: any): Promise<{
        url: string;
    }>;
    deleteAccount(user: AuthUser, confirmPassword?: string): Promise<{
        success: boolean;
    }>;
    getUserById(id: string): Promise<import("./entities/profile.entity").Profile>;
    getAllProfiles(query: PaginationQueryDto): Promise<import("../common/repositories/base.repository").PaginatedResult<import("./entities/profile.entity").Profile>>;
}
