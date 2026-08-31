import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { ProfileRepository } from './profile.repository';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  controllers: [UserProfileController],
  providers: [UserProfileService, ProfileRepository],
  exports: [UserProfileService, ProfileRepository],
})
export class UserProfileModule {}
