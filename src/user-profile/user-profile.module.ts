import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { ProfileRepository } from './profile.repository';
import { Profile } from './entities/profile.entity';
import { User } from '../auth/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User]), NotificationsModule],
  controllers: [UserProfileController],
  providers: [UserProfileService, ProfileRepository],
  exports: [UserProfileService, ProfileRepository],
})
export class UserProfileModule {}
