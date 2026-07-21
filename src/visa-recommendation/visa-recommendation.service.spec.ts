import { Test, TestingModule } from '@nestjs/testing';
import { VisaRecommendationService } from './visa-recommendation.service';
import { OccupationsService } from '../occupations/occupations.service';
import { PolicyConfigService } from '../policy-config/policy-config.service';

describe('VisaRecommendationService', () => {
  let service: VisaRecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisaRecommendationService,
        { provide: OccupationsService, useValue: {} },
        { provide: PolicyConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<VisaRecommendationService>(VisaRecommendationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
