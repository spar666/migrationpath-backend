import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PointsEngineService } from './points-engine.service';
import { PointsCalculatorService } from './points-calculator/points-calculator.service';
import { PointsAggregatorService } from './points-aggregator.service';
import { PointsCaptureService } from './points-capture.service';
import { PointsInputDto, BusinessPointsInputDto } from './dto/points.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { CaptureCalculatorLeadDto } from './dto/capture-lead.dto';
import { SavePointsDto, CompareScenariosDto } from './dto/save-points.dto';
import {
  CreatePointsConfigDto,
  UpdatePointsConfigDto,
} from './dto/update-points-config.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';

import { PointsRuleService } from './points-rule.service';
import { UserPointsService } from './user-points.service';

@ApiTags('points-engine')
@Controller('points')
export class PointsEngineController {
  constructor(
    private readonly pointsEngineService: PointsEngineService,
    private readonly calculator: PointsCalculatorService,
    private readonly aggregator: PointsAggregatorService,
    private readonly pointsRuleService: PointsRuleService,
    private readonly userPointsService: UserPointsService,
    private readonly captureService: PointsCaptureService,
  ) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate GSM points (legacy, public, stateless)' })
  calculate(@Body() input: PointsInputDto) {
    return this.calculator.calculatePoints(input);
  }

  @Post('calculate/total')
  @ApiOperation({
    summary:
      'Aggregate structured points from a user profile (AGE, ENGLISH, work, QUALIFICATIONS, REGIONAL_STUDY) with the 20-point combined-work cap',
  })
  calculateTotal(@Body() profile: UserProfileDto) {
    return this.aggregator.calculateTotalPoints(profile);
  }

  @Post('capture')
  @ApiOperation({
    summary:
      'Capture contact details at the end of the calculator and open a prospect (public)',
    description:
      'The score itself is never gated — POST /points/calculate/total is public and ' +
      'anonymous. This is the step after it: the visitor gives their details to find ' +
      'out what the number means, and lands on the same funnel spine the other ' +
      'entry points use. The score is recomputed here from the submitted inputs.',
  })
  @ApiResponse({
    status: 201,
    description:
      'The recomputed score, per-subclass standing for 189/190/491, and the ' +
      'prospect reference the booking CTA needs. `can_book` is false if the ' +
      'prospect could not be written.',
  })
  capture(@Body() dto: CaptureCalculatorLeadDto) {
    return this.captureService.capture(dto);
  }

  // Retired business calculation (not exposed as an HTTP route).
  @ApiOperation({ summary: 'Calculate Business points (public, stateless)' })
  calculateBusiness(@Body() input: BusinessPointsInputDto) {
    return this.calculator.calculateBusinessPoints(input);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all active points rules (public)' })
  @ApiQuery({
    name: 'visa_group',
    required: false,
    description: 'Optional visa group to filter rules (e.g. GSM, Business)',
  })
  getRules(@Query('visa_group') visa_group?: string) {
    return this.pointsRuleService.findActive(visa_group);
  }

  @Get('config')
  @ApiOperation({
    summary:
      'Get all active points rules — the values the calculator scores against (public)',
  })
  getConfig() {
    return this.pointsEngineService.findAllConfig();
  }

  @Patch('config/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update Points Rubric (admin only)' })
  updateConfig(
    @Param('id') id: string,
    @Body() dto: UpdatePointsConfigDto,
  ) {
    return this.pointsEngineService.updateConfig(id, dto);
  }

  @Post('config')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a points rule (admin only)' })
  createConfig(@Body() dto: CreatePointsConfigDto) {
    return this.pointsEngineService.createConfig(dto);
  }

  @Delete('config/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a points rule (admin only)' })
  removeConfig(@Param('id') id: string) {
    return this.pointsEngineService.removeConfig(id);
  }

  // Retired public account endpoint.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save points calculation to user profile' })
  savePoints(@User() user: AuthUser, @Body() dto: SavePointsDto) {
    return this.userPointsService.save(user.id, dto);
  }

  // Retired public account endpoint.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my latest saved points calculation' })
  getMyPoints(@User() user: AuthUser) {
    return this.userPointsService.getLatest(user.id);
  }

  // Retired public account endpoint.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my points calculation history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPointsHistory(
    @User() user: AuthUser,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userPointsService.getHistory(user.id, limit ?? 10);
  }

  // Retired public account endpoint.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Compare points across different scenarios' })
  compareScenarios(@User() user: AuthUser, @Body() dto: CompareScenariosDto) {
    return this.userPointsService.compareScenarios(user.id, dto);
  }

  @Get('occupation/:anzsco')
  @ApiOperation({ summary: 'Get occupation base points and modifiers' })
  getOccupationPoints(@Param('anzsco') anzsco: string) {
    return this.userPointsService.getOccupationPoints(anzsco);
  }

  @Get('eligibility-ranges')
  @ApiOperation({ summary: 'Get eligibility points ranges by visa type' })
  getEligibilityRanges() {
    return this.userPointsService.getEligibilityRanges();
  }
}
