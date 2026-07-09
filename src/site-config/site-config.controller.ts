import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { SiteConfigService } from './site-config.service';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';

@ApiTags('admin/site-config')
@Controller()
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  // ── Public endpoint (no auth) ─────────────────────────────────

  @Get('public/site-config')
  @ApiOperation({ summary: 'Get published site configuration (public)' })
  getPublicConfig() {
    return this.siteConfigService.getConfig();
  }

  // ── Admin endpoints ───────────────────────────────────────────

  @Get('admin/site-config')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get site configuration (admin)' })
  getConfig() {
    return this.siteConfigService.getConfig();
  }

  @Put('admin/site-config')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update the full site configuration' })
  updateConfig(
    @Body() dto: UpdateSiteConfigDto,
    @User() user: AuthUser,
  ) {
    return this.siteConfigService.updateConfig(dto, user.id);
  }
}
