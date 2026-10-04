import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsEngineService } from './points-engine.service';
import { PointsEngineController } from './points-engine.controller';
import { PointsCalculatorService } from './points-calculator/points-calculator.service';
import { PointsAggregatorService } from './points-aggregator.service';
import { PointsCaptureService } from './points-capture.service';
import { PointsRule } from './entities/points-rule.entity';
import { PointsRuleRepository } from './points-rule.repository';
import { PointsRuleService } from './points-rule.service';
import { UserPoints } from './entities/user-points.entity';
import { UserPointsRepository } from './user-points.repository';
import { UserPointsService } from './user-points.service';
import { OccupationsModule } from '../occupations/occupations.module';
import { PolicyConfigModule } from '../policy-config/policy-config.module';
import { ProspectModule } from '../prospect/prospect.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointsRule, UserPoints]),
    OccupationsModule,
    PolicyConfigModule,
    ProspectModule,
  ],
  controllers: [PointsEngineController],
  providers: [
    PointsEngineService,
    PointsRuleService,
    PointsRuleRepository,
    PointsCalculatorService,
    PointsAggregatorService,
    PointsCaptureService,
    UserPointsRepository,
    UserPointsService,
  ],
  exports: [
    PointsEngineService,
    PointsRuleService,
    PointsRuleRepository,
    PointsCalculatorService,
    PointsAggregatorService,
    PointsCaptureService,
    UserPointsService,
  ],
})
export class PointsEngineModule {}
