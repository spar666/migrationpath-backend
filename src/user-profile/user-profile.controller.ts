import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

/**
 * Admin-only read surface over `profiles`.
 *
 * The end-user `/users/me*` routes (profile, preferences, change-password,
 * avatar, delete-account) were removed with the account layer. The module
 * survives because `Profile` is a 1:1 extension of `users` that
 * `admin/entities/activity-log.entity.ts` joins against, and because these two
 * admin routes live here.
 *
 * The guards moved from per-route to class level: every route below is admin,
 * so there is no longer a mixed public/admin surface to keep straight.
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @ApiOperation({ summary: 'List all profiles (admin only)' })
  getAllProfiles(@Query() query: PaginationQueryDto) {
    return this.userProfileService.getAllProfiles(
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  getUserById(@Param('id') id: string) {
    return this.userProfileService.getUserById(id);
  }
}
