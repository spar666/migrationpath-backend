import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PointsEngineService } from './points-engine.service';
import { PointsCalculatorService } from './points-calculator/points-calculator.service';
import { PointsAggregatorService } from './points-aggregator.service';
import { PointsInputDto, BusinessPointsInputDto } from './dto/points.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { SavePointsDto, CompareScenariosDto } from './dto/save-points.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
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

  @Post('calculate/business')
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
  @ApiOperation({ summary: 'Get all active points configuration (public)' })
  getConfig() {
    return this.pointsEngineService.findAllConfig();
  }

  @Patch('config/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update points configuration (admin only)' })
  updateConfig(@Param('id') id: string, @Body() dto: any) {
    return this.pointsEngineService.updateConfig(id, dto);
  }

  @Post('save')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save points calculation to user profile' })
  savePoints(@User() user: AuthUser, @Body() dto: SavePointsDto) {
    return this.userPointsService.save(user.id, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my latest saved points calculation' })
  getMyPoints(@User() user: AuthUser) {
    return this.userPointsService.getLatest(user.id);
  }

  @Get('history')
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

  @Post('compare')
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
