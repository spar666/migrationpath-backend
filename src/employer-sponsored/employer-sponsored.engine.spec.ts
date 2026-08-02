import { EmployerSponsoredEngine } from './employer-sponsored.engine';

describe('EmployerSponsoredEngine', () => {
  const engine = new EmployerSponsoredEngine();

  it('passes a strong 186 candidate', async () => {
    const r = await engine.assess({
      party: 'business',
      applicant: {
        age: 32,
        years_experience: 5,
        english_overall: 7,
        english_lowest_band: 7,
        occupation_listed: true,
      },
      sponsor: {
        legal_name: 'Acme',
        abn: '123',
        years_trading: 6,
        employee_count: 40,
        meets_training_obligations: true,
        has_adverse_information: false,
      },
      nomination: {
        subclass: '186',
        annual_salary: 120000,
        is_regional: false,
        lmt_completed: true,
      },
    });
    expect(r.statutory_eligible).toBe(true);
    expect(r.client_fit).toBe(true);
    expect(r.recommended_subclass).toBe('186');
  });

  it('fails on age and salary, with readable reasons', async () => {
    const r = await engine.assess({
      party: 'business',
      applicant: {
        age: 52,
        years_experience: 5,
        english_overall: 7,
        english_lowest_band: 7,
        occupation_listed: true,
      },
      sponsor: { legal_name: 'Acme', abn: '123', years_trading: 6 },
      nomination: {
        subclass: '186',
        annual_salary: 50000,
        lmt_completed: true,
      },
    });
    expect(r.statutory_eligible).toBe(false);
    expect(r.client_fit).toBe(false);
    expect(r.blockers.length).toBeGreaterThan(0);
  });

  /**
   * REGRESSION. An empty submission used to come back statutory_eligible=true:
   * with no answers there were no blockers, so every check vacuously "passed".
   * Eligibility now requires that the decisive tests were actually decided,
   * not merely that none of them failed.
   */
  it('treats a blank form as undetermined, not as a pass', async () => {
    const r = await engine.assess({ party: 'applicant', applicant: {} });
    expect(r.statutory_eligible).toBe(false);
    expect(r.blockers).toHaveLength(0);
    expect(r.open_questions.length).toBeGreaterThan(0);
  });

  it('does not let a partial form pass on the strength of what was answered', async () => {
    // Everything filled in is good; salary and occupation are simply missing.
    const r = await engine.assess({
      party: 'applicant',
      applicant: {
        age: 30,
        years_experience: 8,
        english_overall: 8,
        english_lowest_band: 8,
      },
    });
    expect(r.statutory_eligible).toBe(false);
  });

  it('lets sponsor adverse information override a strong applicant', async () => {
    const r = await engine.assess({
      party: 'business',
      applicant: {
        age: 30,
        years_experience: 8,
        english_overall: 8,
        english_lowest_band: 8,
        occupation_listed: true,
      },
      sponsor: {
        legal_name: 'Acme',
        abn: '123',
        years_trading: 10,
        has_adverse_information: true,
      },
      nomination: {
        subclass: '186',
        annual_salary: 150000,
        lmt_completed: true,
      },
    });
    expect(r.statutory_eligible).toBe(false);
  });

  it('uses the injected occupation list check over the form answer', async () => {
    engine.setOccupationListCheck(() => false);
    const r = await engine.assess({
      party: 'business',
      applicant: {
        age: 30,
        years_experience: 8,
        english_overall: 8,
        english_lowest_band: 8,
        occupation_listed: true,
      },
      sponsor: { legal_name: 'Acme', abn: '123', years_trading: 10 },
      nomination: {
        subclass: '186',
        annual_salary: 150000,
        lmt_completed: true,
      },
    });
    expect(r.statutory_eligible).toBe(false);
  });
});
