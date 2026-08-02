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

  /**
   * Preferences are a per-user singleton with sensible defaults, so a missing
   * row is not an error state — it just means the user has never touched them.
   * Returning a 404 here broke GET /notifications/preferences and
   * GET /users/me/preferences for every account created before the row existed.
   */
  async findOrCreateByUserId(userId: string): Promise<NotificationPreference> {
    const existing = await this.repository.findOne({
      where: { user_id: userId },
    });
    if (existing) return existing;

    try {
      return await this.repository.save(
        this.repository.create({ user_id: userId }),
      );
    } catch {
      // Lost a race with a concurrent request — the row exists now.
      return this.findByUserId(userId);
    }
  }

  async updateByUserId(
    userId: string,
    data: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    await this.findOrCreateByUserId(userId);
    await this.repository.update({ user_id: userId }, data);
    return this.findByUserId(userId);
  }
}
