import { Test, TestingModule } from '@nestjs/testing';
import { PointsEngineService } from './points-engine.service';
import { PointsRuleRepository } from './points-rule.repository';

describe('PointsEngineService', () => {
  let service: PointsEngineService;
  let ruleRepo: {
    findAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    ruleRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      create: jest.fn((data) => Promise.resolve(data)),
      update: jest.fn((id, data) => Promise.resolve({ id, ...data })),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsEngineService,
        { provide: PointsRuleRepository, useValue: ruleRepo },
      ],
    }).compile();

    service = module.get<PointsEngineService>(PointsEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * The whole point of this service's rewiring: the admin screen used to edit
   * `points_config`, which no calculation ever read. These assertions pin it to
   * `points_rules` — the table PointsAggregatorService scores against — so a
   * future refactor cannot quietly reintroduce the split.
   */
  it('reads the rules the calculator scores against, not points_config', async () => {
    await service.findAllConfig();
    expect(ruleRepo.findAll).toHaveBeenCalledWith({ is_active: true });
  });

  it('writes edits to the rules table', async () => {
    await service.updateConfig('rule-1', { points_value: 30 });
    expect(ruleRepo.update).toHaveBeenCalledWith('rule-1', {
      points_value: 30,
    });
  });

  it('defaults a new rule to the GSM visa group', async () => {
    await service.createConfig({ category: 'AGE', points_value: 25 });
    expect(ruleRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ visa_group: 'GSM', category: 'AGE' }),
    );
  });
});
