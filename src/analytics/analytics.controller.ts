import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('analytics')
@UseInterceptors(CacheInterceptor)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('invitation-trends')
  @CacheKey('invitation_trends')
  @CacheTTL(3600) // 1 hour
  @ApiOperation({ summary: 'Get invitation trends' })
  getTrends(@Query() query: PaginationQueryDto) {
    return this.analyticsService.getInvitationTrends(
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get('state-nominations')
  @CacheKey('state_nominations')
  @CacheTTL(86400) // 24 hours
  @ApiOperation({ summary: 'Get current state nomination rules' })
  getNominations() {
    return this.analyticsService.getStateNominations();
  }
}
