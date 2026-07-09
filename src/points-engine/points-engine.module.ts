import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsEngineService } from './points-engine.service';
import { PointsEngineController } from './points-engine.controller';
import { PointsConfigRepository } from './points-config.repository';
import { PointsConfig } from './entities/points-config.entity';
import { PointsCalculatorService } from './points-calculator/points-calculator.service';
import { PointsAggregatorService } from './points-aggregator.service';
import { PointsRule } from './entities/points-rule.entity';
import { PointsRuleRepository } from './points-rule.repository';
import { PointsRuleService } from './points-rule.service';
import { UserPoints } from './entities/user-points.entity';
import { UserPointsRepository } from './user-points.repository';
import { UserPointsService } from './user-points.service';
import { OccupationsModule } from '../occupations/occupations.module';
import { PolicyConfigModule } from '../policy-config/policy-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointsConfig, PointsRule, UserPoints]),
    OccupationsModule,
    PolicyConfigModule,
  ],
  controllers: [PointsEngineController],
  providers: [
    PointsEngineService,
    PointsRuleService,
    PointsConfigRepository,
    PointsRuleRepository,
    PointsCalculatorService,
    PointsAggregatorService,
    UserPointsRepository,
    UserPointsService,
  ],
  exports: [
    PointsEngineService,
    PointsRuleService,
    PointsConfigRepository,
    PointsRuleRepository,
    PointsCalculatorService,
    PointsAggregatorService,
    UserPointsService,
  ],
})
export class PointsEngineModule {}
