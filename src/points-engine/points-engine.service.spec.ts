import { Test, TestingModule } from '@nestjs/testing';
import { PointsEngineService } from './points-engine.service';

describe('PointsEngineService', () => {
  let service: PointsEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointsEngineService],
    }).compile();

    service = module.get<PointsEngineService>(PointsEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
