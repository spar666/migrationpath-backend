import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProspectService } from './prospect.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { ReportBookingDto } from './dto/report-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { ProspectParty, ProspectStage } from './entities/prospect.entity';

@ApiTags('prospects')
@Controller('prospects')
export class ProspectController {
  constructor(private readonly prospectService: ProspectService) {}

  /**
   * PUBLIC. Lightweight capture for calculators and other verticals that do
   * not run the employer-sponsored engine. The questionnaire uses
   * POST /pre-screen instead — both write the same spine.
   *
   * Same reasoning as POST /leads: this is an anonymous write endpoint, so the
   * global 100/60s throttle is too loose and it gets its own tighter limit.
   */
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Capture a prospect from a calculator or partial form (public)',
  })
  async capture(@Body() dto: CreateProspectDto) {
    const prospect = await this.prospectService.capture(dto);
    // Only ever echo back what the prospect needs to identify themselves —
    // this endpoint is unauthenticated, so the full row must not go out.
    return {
      prospect_id: prospect.id,
      human_ref: prospect.human_ref,
      stage: prospect.stage,
    };
  }

  /**
   * PUBLIC, but double-keyed: the caller must present both the uuid and the
   * human reference. This is how the prospect's own browser reads the state of
   * their booking after the Stripe redirect, when they have no token.
   *
   * Declared BEFORE `@Get(':id')` because Nest matches routes in declaration
   * order — the other way round, ':id' would swallow this path.
   *
   * Throttled tighter than the global default: the ref is short enough that an
   * unthrottled endpoint would be worth brute-forcing.
   */
  @Get(':id/status')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Read the funnel state of your own prospect record (public)',
  })
  getPublicStatus(@Param('id') id: string, @Query('ref') ref: string) {
    return this.prospectService.getPublicStatus(id, ref);
  }

  /**
   * PUBLIC, double-keyed the same way as /status.
   *
   * The browser reporting a slot it just watched Calendly confirm. This is what
   * stops a late, misconfigured or (in local development) undeliverable invitee
   * webhook from presenting to the visitor as "we have no record of the time
   * you just booked" when they try to pay.
   *
   * Safe to expose anonymously because of what it cannot do: it creates a
   * PENDING booking and nothing more. Confirming a consultation remains
   * Stripe's webhook alone, so the worst outcome available here is an unpaid
   * row in the agent's follow-up queue.
   */
  @Post(':id/booking')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Report a consultation slot confirmed in the browser (public)',
  })
  reportBooking(
    @Param('id') id: string,
    @Query('ref') ref: string,
    @Body() dto: ReportBookingDto,
  ) {
    return this.prospectService.reportBooking(id, ref, {
      inviteeUri: dto.invitee_uri,
      eventUri: dto.event_uri,
      startsAt: dto.starts_at,
      endsAt: dto.ends_at,
    });
  }

  // --- Agent-facing, admin only ---

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List prospects (admin only)' })
  list(
    @Query() query: PaginationQueryDto,
    @Query('stage') stage?: ProspectStage,
    @Query('party') party?: ProspectParty,
  ) {
    const filters: Record<string, unknown> = {};
    if (stage) filters.stage = stage;
    if (party) filters.party = party;
    return this.prospectService.list(
      query.page ?? 1,
      query.limit ?? 20,
      filters,
    );
  }

  /**
   * The prep view — prospect plus the stitched summary. This is what the
   * booking-confirmed alert deep-links to.
   */
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get a prospect with its prep summary (admin only)',
  })
  getOne(@Param('id') id: string) {
    return this.prospectService.getPrepView(id);
  }

  @Get('ref/:humanRef')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Look a prospect up by its human reference (admin only)',
  })
  getByRef(@Param('humanRef') humanRef: string) {
    return this.prospectService.findByHumanRef(humanRef);
  }

  @Patch(':id/stage')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Advance a prospect to a later stage (admin only)' })
  advance(@Param('id') id: string, @Body('stage') stage: ProspectStage) {
    return this.prospectService.advanceStage(id, stage);
  }
}
