import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileRepository } from './profile.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { User } from '../auth/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';
import { PaginatedResult } from '../common/repositories/base.repository';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getMyProfile(userId: string): Promise<Profile> {
    return this.profileRepo.findByUserId(userId);
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.profileRepo.updateByUserId(userId, dto);
  }

  async getAllProfiles(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Profile>> {
    return this.profileRepo.paginate(page, limit);
  }

  async getUserById(id: string): Promise<Profile> {
    const profile = await this.profileRepo.findByUserId(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async getPreferences(userId: string) {
    try {
      const prefs = await this.notificationsService.getPreferences(userId);
      return {
        notificationEmail: prefs.email_updates,
        notificationSMS: prefs.invitation_alerts,
        marketingEmails: prefs.news_alerts,
        theme: 'light' as const,
        language: 'en',
      };
    } catch {
      return {
        notificationEmail: true,
        notificationSMS: true,
        marketingEmails: true,
        theme: 'light' as const,
        language: 'en',
      };
    }
  }

  async updatePreferences(userId: string, dto: any) {
    const updateData: any = {};
    if (dto.notificationEmail !== undefined)
      updateData.email_updates = dto.notificationEmail;
    if (dto.notificationSMS !== undefined)
      updateData.invitation_alerts = dto.notificationSMS;
    if (dto.marketingEmails !== undefined)
      updateData.news_alerts = dto.marketingEmails;

    await this.notificationsService.updatePreferences(userId, updateData);
    return this.getPreferences(userId);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { success: true };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    await this.profileRepo.updateByUserId(userId, { avatar_url: avatarUrl });
    return { url: avatarUrl };
  }

  async deleteAccount(userId: string, confirmPassword?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (confirmPassword) {
      const isPasswordValid = await bcrypt.compare(
        confirmPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password confirmation');
      }
    }

    await this.userRepository.delete(userId);
    return { success: true };
  }
}
