import { EmployerSponsoredEngine } from './employer-sponsored.engine';
import { PolicyConfigService } from '../policy-config/policy-config.service';
import { CommercialConfigService } from '../commercial-config/commercial-config.module';

export function testEmployerPolicy() {
  const map = new Map(Object.entries({
    'employer.coreSkillsIncome': 80000, 'employer.specialistIncome': 140000,
    'employer.maxAge': 45, 'employer.deMinExperienceYears': 3,
    'employer.trtMinSponsoredYears': 2, 'employer.coreMinExperienceYears': 1,
    'employer.regionalMinExperienceYears': 3,
  }));
  for (const stream of ['482-core','482-specialist','186-de','186-trt','494-es']) {
    map.set(`employer.${stream}.englishOverall`, 6);
    map.set(`employer.${stream}.englishPerBand`, 6);
  }
  return map;
}
export function testCommercialPolicy() { return new Map(Object.entries({ minSalaryOfInterest: 70000, hardAgeCeiling: 50, requireAbnForBusiness: 1,
  'service.482-core': 1, 'service.482-specialist': 1, 'service.186-de': 1, 'service.186-trt': 1, 'service.494-es': 1 })); }

describe('Employer stream evaluation', () => {
  let engine: EmployerSponsoredEngine;
  let values: Map<string, number>;
  let commercial: Map<string, number>;
  const applicant = { age: 32, years_experience: 5, english_overall: 7, english_lowest_band: 7, occupation_code: '261313' };
  beforeEach(() => {
    values = testEmployerPolicy(); commercial = testCommercialPolicy();
    engine = new EmployerSponsoredEngine({ employerSnapshot: async () => values } as PolicyConfigService,
      { snapshot: async () => commercial } as CommercialConfigService);
    engine.setOccupationListCheck(() => true);
  });
  it('evaluates all five branches despite a preferred subclass', async () => {
    const r = await engine.assess({ party: 'applicant', applicant, nomination: { subclass: '482', annual_salary: 100000 } });
    expect(r.assessments).toHaveLength(5);
    expect(r.best_fit_pathway).toBe('186-de');
    expect(r.statutory_eligible).toBe(true);
  });
  it('Specialist bypasses CSOL and checks major group plus its own income', async () => {
    engine.setOccupationListCheck(() => false);
    const r = await engine.assess({ party: 'applicant', applicant, nomination: { annual_salary: 150000 } });
    expect(r.recommended_subclass).toBe('482-specialist');
    expect(r.statutory_eligible).toBe(true);
    const excluded = await engine.assess({ party: 'applicant', applicant: { ...applicant, occupation_code: '331211' }, nomination: { annual_salary: 150000 } });
    expect(excluded.assessments.find(a => a.subclass === '482-specialist')?.gap_codes).toContain('occupation_group_excluded');
  });
  it('TRT uses qualifying visa and sponsored history without CSOL', async () => {
    engine.setOccupationListCheck(() => false);
    const r = await engine.assess({ party: 'applicant', applicant: { ...applicant, current_visa: '482', sponsored_work_years: 2 }, nomination: { annual_salary: 100000 } });
    expect(r.recommended_subclass).toBe('186-trt');
  });
  it('missing English components never pass', async () => {
    const r = await engine.assess({ party: 'applicant', applicant: { ...applicant, english_lowest_band: undefined }, nomination: { annual_salary: 150000 } });
    expect(r.statutory_eligible).toBe(false);
    expect(r.outcome_tag).toBe('incomplete');
  });
  it('empty input is incomplete, not eligible or a hard rejection', async () => {
    const r = await engine.assess({ party: 'applicant' });
    expect(r.statutory_eligible).toBe(false); expect(r.blockers).toEqual([]);
  });
  it('keeps a salary-only near miss commercially fit', async () => {
    const r = await engine.assess({ party: 'applicant', applicant, nomination: { annual_salary: 75000 } });
    expect(r.statutory_eligible).toBe(false); expect(r.client_fit).toBe(true);
    expect(r.outcome_tag).toBe('income_below_threshold'); expect(r.gap_codes).toEqual(['income_short']);
  });
  it('reads changed policy and commercial settings on the next assessment', async () => {
    values.set('employer.coreSkillsIncome', 120000); commercial.set('minSalaryOfInterest', 130000);
    const r = await engine.assess({ party: 'applicant', applicant, nomination: { annual_salary: 100000 } });
    expect(r.statutory_eligible).toBe(false); expect(r.client_fit).toBe(false);
  });
  it('unverified policy cannot qualify anyone or display infinite thresholds', async () => {
    values.clear();
    const r = await engine.assess({ party: 'applicant', applicant, nomination: { annual_salary: 150000 } });
    expect(r.statutory_eligible).toBe(false); expect(r.outcome_tag).toBe('review_required');
    expect(JSON.stringify(r)).not.toContain('Infinity');
  });
  it('uses an exclusive age limit for PR and keeps 482 available', async () => {
    const r = await engine.assess({ party: 'applicant', applicant: { ...applicant, age: 45 }, nomination: { annual_salary: 100000 } });
    expect(r.assessments.find(a => a.subclass === '186-de')?.eligible).toBe(false);
    expect(r.recommended_subclass).toBe('482-core');
  });
  it('refers exemptions and Labour Agreements for professional review', async () => {
    const r = await engine.assess({ party: 'applicant', applicant: { ...applicant, requests_exemption: true }, nomination: { annual_salary: 150000 } });
    expect(r.statutory_eligible).toBe(false); expect(r.outcome_tag).toBe('review_required');
    expect(r.rma_review_flags).toContain('possible_exemption');
    expect(r.gap_codes).toContain('professional_review');
  });
  it('keeps declared operational risks separate from legal and commercial outcomes', async () => {
    const r = await engine.assess({
      party: 'business',
      applicant: { ...applicant, has_health_or_character_concern: true },
      sponsor: { abn: '12345678901', has_adverse_information: true },
      nomination: { annual_salary: 150000, lmt_completed: true },
    });
    expect(r.rma_review_flags).toEqual(expect.arrayContaining([
      'health_character',
      'lmt_adequacy',
      'amsr',
      'genuine_position',
    ]));
    expect(r.risk_flags).toEqual(expect.arrayContaining([
      'health_character_concern',
      'sponsor_adverse_information',
    ]));
  });
});
