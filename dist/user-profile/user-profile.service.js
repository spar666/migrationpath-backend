"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profile_repository_1 = require("./profile.repository");
const user_entity_1 = require("../auth/entities/user.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const bcrypt = __importStar(require("bcrypt"));
let UserProfileService = class UserProfileService {
    profileRepo;
    notificationsService;
    userRepository;
    constructor(profileRepo, notificationsService, userRepository) {
        this.profileRepo = profileRepo;
        this.notificationsService = notificationsService;
        this.userRepository = userRepository;
    }
    async getMyProfile(userId) {
        return this.profileRepo.findByUserId(userId);
    }
    async updateMyProfile(userId, dto) {
        return this.profileRepo.updateByUserId(userId, dto);
    }
    async getAllProfiles(page, limit) {
        return this.profileRepo.paginate(page, limit);
    }
    async getUserById(id) {
        const profile = await this.profileRepo.findByUserId(id);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return profile;
    }
    async getPreferences(userId) {
        try {
            const prefs = await this.notificationsService.getPreferences(userId);
            return {
                notificationEmail: prefs.email_updates,
                notificationSMS: prefs.invitation_alerts,
                marketingEmails: prefs.news_alerts,
                theme: 'light',
                language: 'en',
            };
        }
        catch {
            return {
                notificationEmail: true,
                notificationSMS: true,
                marketingEmails: true,
                theme: 'light',
                language: 'en',
            };
        }
    }
    async updatePreferences(userId, dto) {
        const updateData = {};
        if (dto.notificationEmail !== undefined)
            updateData.email_updates = dto.notificationEmail;
        if (dto.notificationSMS !== undefined)
            updateData.invitation_alerts = dto.notificationSMS;
        if (dto.marketingEmails !== undefined)
            updateData.news_alerts = dto.marketingEmails;
        await this.notificationsService.updatePreferences(userId, updateData);
        return this.getPreferences(userId);
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid old password');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await this.userRepository.save(user);
        return { success: true };
    }
    async updateAvatar(userId, avatarUrl) {
        await this.profileRepo.updateByUserId(userId, { avatar_url: avatarUrl });
        return { url: avatarUrl };
    }
    async deleteAccount(userId, confirmPassword) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (confirmPassword) {
            const isPasswordValid = await bcrypt.compare(confirmPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid password confirmation');
            }
        }
        await this.userRepository.delete(userId);
        return { success: true };
    }
};
exports.UserProfileService = UserProfileService;
exports.UserProfileService = UserProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [profile_repository_1.ProfileRepository,
        notifications_service_1.NotificationsService,
        typeorm_2.Repository])
], UserProfileService);
//# sourceMappingURL=user-profile.service.js.map