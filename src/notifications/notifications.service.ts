import { Injectable } from '@nestjs/common';
import { NotificationPreferencesRepository } from './notifications.repository';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { NotificationPreference } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly preferencesRepo: NotificationPreferencesRepository,
  ) {}

  async getPreferences(userId: string): Promise<NotificationPreference> {
    return this.preferencesRepo.findByUserId(userId);
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreference> {
    return this.preferencesRepo.updateByUserId(userId, dto);
  }
}
