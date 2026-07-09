import { Test, TestingModule } from '@nestjs/testing';
import { PointsCalculatorService } from './points-calculator.service';
import { PointsConfigRepository } from '../points-config.repository';
import { PointsRuleRepository } from '../points-rule.repository';

describe('PointsCalculatorService', () => {
  let service: PointsCalculatorService;

  const mockConfigRepo = {
    findAllActive: jest.fn().mockResolvedValue([]),
  };

  const mockRuleRepo = {
    findAll: jest.fn().mockResolvedValue([
      {
        id: '1',
        category: 'age',
        min_value: 25,
        max_value: 32,
        points_value: 30,
        is_active: true,
        visa_group: 'GSM',
      },
      {
        id: '2',
        category: 'english',
        attribute_label: 'superior',
        points_value: 20,
        is_active: true,
        visa_group: 'GSM',
      },
      {
        id: '3',
        category: 'education',
        attribute_label: 'bachelors_masters',
        points_value: 15,
        is_active: true,
        visa_group: 'GSM',
      },
      {
        id: '4',
        category: 'work_experience',
        sub_category: 'overseas_3_4',
        min_value: 3,
        max_value: 4,
        points_value: 5,
        is_active: true,
        visa_group: 'GSM',
      },
      {
        id: '5',
        category: 'work_experience',
        sub_category: 'australia_1_2',
        min_value: 1,
        max_value: 2,
        points_value: 5,
        is_active: true,
        visa_group: 'GSM',
      },
      {
        id: '6',
        category: 'nomination',
        attribute_label: '190',
        points_value: 5,
        is_active: true,
        visa_group: 'GSM',
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsCalculatorService,
        { provide: PointsConfigRepository, useValue: mockConfigRepo },
        { provide: PointsRuleRepository, useValue: mockRuleRepo },
      ],
    }).compile();

    service = module.get<PointsCalculatorService>(PointsCalculatorService);
  });

  it('calculates points with seed rules (happy path)', async () => {
    const input = {
      visaGroup: 'GSM',
      subclass: '189',
      age: 30,
      englishLevel: 'superior',
      educationLevel: 'bachelors_masters',
      workExperienceOverseas: 3,
      workExperienceAustralia: 2,
      australianStudyRequirement: false,
      isRegional: false,
      naati: false,
      professionalYear: false,
    } as any;

    const result = await service.calculatePoints(input);
    expect(result.totalPoints).toBeGreaterThan(0);
    expect(result.breakdown.age).toBe(30);
    expect(result.breakdown.english).toBe(20);
    expect(result.breakdown.education).toBe(15);
  });

  it('returns ineligible for age 45+', async () => {
    const input = {
      visaGroup: 'GSM',
      subclass: '189',
      age: 45,
      englishLevel: 'competent',
      educationLevel: 'bachelors_masters',
      workExperienceOverseas: 0,
      workExperienceAustralia: 0,
    } as any;

    const result = await service.calculatePoints(input);
    expect(result.totalPoints).toBe(0);
    expect(result.ineligibilityReason).toContain('under 45');
  });

  it('caps work experience at 20 points', async () => {
    const input = {
      visaGroup: 'GSM',
      subclass: '189',
      age: 30,
      englishLevel: 'competent',
      educationLevel: 'diploma_trade',
      workExperienceOverseas: 10,
      workExperienceAustralia: 10,
    } as any;

    const result = await service.calculatePoints(input);
    expect(result.breakdown.work_experience).toBeLessThanOrEqual(20);
  });

  it('shows below pass mark for scores under 65', async () => {
    const input = {
      visaGroup: 'GSM',
      subclass: '189',
      age: 40,
      englishLevel: 'competent',
      educationLevel: 'diploma_trade',
      workExperienceOverseas: 0,
      workExperienceAustralia: 0,
    } as any;

    const result = await service.calculatePoints(input);
    expect(result.totalPoints).toBeLessThan(65);
    expect(result.belowPassMark).toBe(true);
  });
});
