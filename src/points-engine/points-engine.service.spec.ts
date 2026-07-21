import { Test, TestingModule } from '@nestjs/testing';
import { PointsEngineService } from './points-engine.service';
import { PointsConfigRepository } from './points-config.repository';

describe('PointsEngineService', () => {
  let service: PointsEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsEngineService,
        { provide: PointsConfigRepository, useValue: { findAllActive: jest.fn() } },
      ],
    }).compile();

    service = module.get<PointsEngineService>(PointsEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
