import { Test, TestingModule } from '@nestjs/testing';
import { PointsEngineController } from './points-engine.controller';

describe('PointsEngineController', () => {
  let controller: PointsEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointsEngineController],
    }).compile();

    controller = module.get<PointsEngineController>(PointsEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
