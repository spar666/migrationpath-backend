import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getPreferences(user: AuthUser): Promise<import("./entities/notification.entity").NotificationPreference>;
    updatePreferences(user: AuthUser, dto: UpdateNotificationPreferencesDto): Promise<import("./entities/notification.entity").NotificationPreference>;
}
