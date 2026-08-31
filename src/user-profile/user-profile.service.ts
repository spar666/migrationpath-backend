import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { Profile } from './entities/profile.entity';
import { PaginatedResult } from '../common/repositories/base.repository';

/**
 * Admin-only reads over `profiles`.
 *
 * Everything keyed on "the caller's own profile" — getMyProfile,
 * updateMyProfile, preferences, changePassword, updateAvatar, deleteAccount —
 * came out with the account layer, and with it this service's dependencies on
 * the `User` repository, `NotificationsService` and bcrypt.
 *
 * `ensureProfile` went too. It self-healed a missing `profiles` row on read,
 * which mattered when sign-up might have failed to seed one. Nothing creates
 * accounts through the API now, so a missing profile is a real inconsistency
 * worth surfacing rather than papering over: getUserById 404s instead.
 */
@Injectable()
export class UserProfileService {
  constructor(private readonly profileRepo: ProfileRepository) {}

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
}
