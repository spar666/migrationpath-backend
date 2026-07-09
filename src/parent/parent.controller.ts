import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParentAuditEngine } from './parent-audit.engine';
import { ParentProfileDto } from './dto/parent-profile.dto';
import { ParentAuditResultDto } from './dto/parent-audit-result.dto';

@ApiTags('parent')
@Controller('parent')
export class ParentController {
  constructor(private readonly parentAuditEngine: ParentAuditEngine) {}

  @Post('audit')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary:
      'Parent visa gateway: sponsor check, Balance of Family Test, and Assurance of Support income check (804/143)',
  })
  @ApiResponse({ status: 200, type: ParentAuditResultDto })
  audit(@Body() profile: ParentProfileDto): Promise<ParentAuditResultDto> {
    return this.parentAuditEngine.calculateParentEligibility(profile);
  }
}
