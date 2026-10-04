import { PointsCalculatorService } from './points-calculator.service';
import { PointsAggregatorService } from '../points-aggregator.service';
import { STRUCTURED_POINTS_RULES } from '../constants/points-catalogue';
import { PointsRuleRepository } from '../points-rule.repository';
import { PolicyConfigService } from '../../policy-config/policy-config.service';

describe('Shared GSM calculator', () => {
  const configured = new Map<string, number>([
    ['points.gsmMaxAge', 45],
    ['points.combinedWorkCap', 20],
    ['points.gsmPassMark', 65],
    ['points.stateNominationBonus', 5],
    ['points.regionalNominationBonus', 15],
  ]);
  const policy = {
    getRequiredNumber: async (key: string) => configured.get(key)!,
    latestEffectiveDate: async () => null,
  } as unknown as PolicyConfigService;
  const rules = STRUCTURED_POINTS_RULES.map(r => ({ category: r.category, attribute_label: r.attributeLabel,
    min_value: r.minValue, max_value: r.maxValue, points_value: r.points, is_active: true }));
  const aggregator = new PointsAggregatorService({ findActive: async () => rules } as unknown as PointsRuleRepository, policy);
  const calculator = new PointsCalculatorService(aggregator, policy);
  const input = { visaGroup: 'GSM', subclass: '189', age: 30, englishLevel: 'superior', educationLevel: 'bachelor_masters', workExperienceOverseas: 8, workExperienceAustralia: 8 };
  it('uses the real uppercase rubric and caps combined employment', async () => {
    const r = await calculator.calculatePoints(input);
    expect(r.totalPoints).toBe(85); expect(r.breakdown.WORK_EXPERIENCE_COMBINED).toBe(20);
  });
  it('shares base scoring across the three subclasses', async () => {
    const scores = await Promise.all(['189','190','491'].map(subclass => calculator.calculatePoints({ ...input, subclass })));
    expect(scores.map(s => s.totalPoints)).toEqual([85,90,100]);
  });
  it('reads additional factors from rubric rows', async () => {
    const repo = { findActive: async () => [...rules,
      ...['AUSTRALIAN_STUDY','SPECIALIST_EDUCATION','PROFESSIONAL_YEAR','COMMUNITY_LANGUAGE','PARTNER_SKILLS'].map((category,i) => ({ category, attribute_label: ['standard','stem_research','standard','ccl','english_only'][i], points_value: 5, is_active: true }))] };
    const service = new PointsCalculatorService(new PointsAggregatorService(repo as unknown as PointsRuleRepository, policy), policy);
    const r = await service.calculatePoints({ ...input, australianStudyRequirement: true, stemResearch: true, professionalYear: true, naati: true, partnerSkills: 'english_only' });
    expect(r.totalPoints).toBe(110);
  });
  it('reports the configured age boundary', async () => {
    expect((await calculator.calculatePoints({ ...input, age: 45 })).ineligibilityReason).toContain('45');
  });
  it('rejects superseded business scoring', async () => {
    await expect(calculator.calculatePoints({ ...input, subclass: '188' })).rejects.toThrow('Only GSM');
  });
});
