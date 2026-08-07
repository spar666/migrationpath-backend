import { NotificationPreferencesRepository } from './notifications.repository';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { NotificationPreference } from './entities/notification.entity';
export declare class NotificationsService {
    private readonly preferencesRepo;
    constructor(preferencesRepo: NotificationPreferencesRepository);
    getPreferences(userId: string): Promise<NotificationPreference>;
    updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto): Promise<NotificationPreference>;
}
