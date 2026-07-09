import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PartnerAuditEngine } from './partner-audit.engine';
import { PartnerProfileDto } from './dto/partner-profile.dto';
import { PartnerAuditResultDto } from './dto/partner-audit-result.dto';

@ApiTags('partner')
@Controller('partner')
export class PartnerController {
  constructor(private readonly partnerAuditEngine: PartnerAuditEngine) {}

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
}
