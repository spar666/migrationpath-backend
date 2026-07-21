import { Test, TestingModule } from '@nestjs/testing';
import { PointsEngineController } from './points-engine.controller';
import { PointsEngineService } from './points-engine.service';
import { PointsCalculatorService } from './points-calculator/points-calculator.service';
import { PointsAggregatorService } from './points-aggregator.service';
import { PointsRuleService } from './points-rule.service';
import { UserPointsService } from './user-points.service';

describe('PointsEngineController', () => {
  let controller: PointsEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointsEngineController],
      providers: [
        { provide: PointsEngineService, useValue: {} },
        { provide: PointsCalculatorService, useValue: {} },
        { provide: PointsAggregatorService, useValue: {} },
        { provide: PointsRuleService, useValue: {} },
        { provide: UserPointsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<PointsEngineController>(PointsEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
