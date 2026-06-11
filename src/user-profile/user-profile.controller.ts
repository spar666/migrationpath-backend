import {
  Controller,
  Get,
  Patch,
  Put,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from './user-profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getMyProfile(@User() user: AuthUser) {
    return this.userProfileService.getMyProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  updateMyProfile(@User() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.userProfileService.updateMyProfile(user.id, dto);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update my profile' })
  updateMyProfilePut(@User() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.userProfileService.updateMyProfile(user.id, dto);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get my user preferences' })
  getPreferences(@User() user: AuthUser) {
    return this.userProfileService.getPreferences(user.id);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update my user preferences' })
  updatePreferences(@User() user: AuthUser, @Body() dto: any) {
    return this.userProfileService.updatePreferences(user.id, dto);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change password' })
  changePassword(@User() user: AuthUser, @Body() dto: any) {
    return this.userProfileService.changePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload avatar' })
  uploadAvatar(@User() user: AuthUser, @UploadedFile() file: any) {
    const avatarUrl = `/uploads/${file?.originalname || 'avatar.png'}`;
    return this.userProfileService.updateAvatar(user.id, avatarUrl);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete account' })
  deleteAccount(
    @User() user: AuthUser,
    @Query('confirmPassword') confirmPassword?: string,
  ) {
    return this.userProfileService.deleteAccount(user.id, confirmPassword);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  getUserById(@Param('id') id: string) {
    return this.userProfileService.getUserById(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all profiles (admin only)' })
  getAllProfiles(@Query() query: PaginationQueryDto) {
    return this.userProfileService.getAllProfiles(
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
