import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { NotificationPreference } from './entities/notification.entity';

@Injectable()
export class NotificationPreferencesRepository extends BaseRepository<NotificationPreference> {
  constructor(
    @InjectRepository(NotificationPreference)
    private readonly notificationPreferenceRepository: Repository<NotificationPreference>,
  ) {
    super(notificationPreferenceRepository);
  }

  async findByUserId(userId: string): Promise<NotificationPreference> {
    const prefs = await this.repository.findOne({
      where: { user_id: userId },
    });

    if (!prefs) {
      throw new NotFoundException(
        `Notification preferences for user ${userId} not found`,
      );
    }

    return prefs;
  }

  async updateByUserId(
    userId: string,
    data: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    await this.repository.update({ user_id: userId }, data);
    return this.findByUserId(userId);
  }
}
