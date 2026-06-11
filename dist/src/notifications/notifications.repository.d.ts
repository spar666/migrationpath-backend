import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { NotificationPreference } from './entities/notification.entity';
export declare class NotificationPreferencesRepository extends BaseRepository<NotificationPreference> {
    private readonly notificationPreferenceRepository;
    constructor(notificationPreferenceRepository: Repository<NotificationPreference>);
    findByUserId(userId: string): Promise<NotificationPreference>;
    updateByUserId(userId: string, data: Partial<NotificationPreference>): Promise<NotificationPreference>;
}
