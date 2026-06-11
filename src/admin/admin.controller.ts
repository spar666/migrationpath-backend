import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall dashboard summary' })
  getSummary(@User() user: AuthUser) {
    return this.adminService.getDashboardSummary(user.id);
  }

  @Get('activity-log')
  @ApiOperation({ summary: 'Get global activity log' })
  getActivityLog(@Query() query: PaginationQueryDto) {
    return this.adminService.getActivityLog(query.page ?? 1, query.limit ?? 20);
  }
}
