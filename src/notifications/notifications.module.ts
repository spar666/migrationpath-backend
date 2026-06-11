import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationPreferencesRepository } from './notifications.repository';
import { NotificationPreference } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreference])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationPreferencesRepository],
  exports: [NotificationsService, NotificationPreferencesRepository],
})
export class NotificationsModule {}
