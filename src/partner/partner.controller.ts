import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PartnerAuditEngine } from './partner-audit.engine';
import { PartnerProfileDto } from './dto/partner-profile.dto';
import { PartnerAuditResultDto } from './dto/partner-audit-result.dto';
import { PartnerEligibilityService } from './partner-eligibility.service';
import { PartnerEligibilityDto } from './dto/partner-eligibility.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('partner')
@Controller('partner')
export class PartnerController {
  constructor(
    private readonly partnerAuditEngine: PartnerAuditEngine,
    private readonly eligibilityService: PartnerEligibilityService,
  ) {}

  @Post('audit')
  @HttpCode(200)
  // Public lead-gen endpoint — rate limit per IP on top of the global guard.
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary:
      'Score partner-visa evidentiary readiness across the four legislative pillars (820/309)',
  })
  @ApiResponse({ status: 200, type: PartnerAuditResultDto })
  audit(@Body() profile: PartnerProfileDto): Promise<PartnerAuditResultDto> {
    return this.partnerAuditEngine.calculatePartnerReadiness(profile);
  }

  // Public lead-gen endpoint for the partner-visa eligibility quiz.
  // Tighter per-IP limit than the global guard, matching the leads endpoint.
  @Post('eligibility')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary:
      'Submit the partner-visa eligibility quiz (820/801/309/100/300); computes and stores the outcome',
  })
  submitEligibility(@Body() dto: PartnerEligibilityDto) {
    return this.eligibilityService.submit(dto);
  }

  @Get('eligibility')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List eligibility quiz submissions (admin only)' })
  listEligibility(@Query() query: PaginationQueryDto) {
    return this.eligibilityService.findAll(query.page ?? 1, query.limit ?? 20);
  }
}
