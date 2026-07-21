import { PartnerEligibilityEngine } from './partner-eligibility.engine';
import { PartnerEligibilityDto } from './dto/partner-eligibility.dto';

/** A married onshore couple with no complications — the happy path. */
function baseAnswers(overrides: Partial<PartnerEligibilityDto> = {}): PartnerEligibilityDto {
  return {
    applicantFirstName: 'A',
    sponsorFirstName: 'S',
    completedBy: 'Applicant',
    applicantCountry: 'Australia',
    sponsorResidencyStatus: 'Australian citizen by birth',
    relationshipStatus: 'Married',
    marriageDate: '2020-01-15',
    datingStartDate: '2018-05-01',
    exclusiveRelationship: 'Yes',
    liveTogetherNow: 'Yes',
    livingTogetherSince: '2019-01-01',
    apartOverMonth: 'No',
    additionalMigratingMembers: '0',
    seriousHealthConditions: 'No',
    bothOver18: 'Yes',
    visaIssues: 'No',
    criminalOffences: 'No',
    techComfort: 'Very comfortable',
    email: 'a@example.com',
    ...overrides,
  } as PartnerEligibilityDto;
}

describe('PartnerEligibilityEngine', () => {
  const engine = new PartnerEligibilityEngine();

  it('marks the happy path Eligible - Low Risk / Low Effort', () => {
    const result = engine.assess(baseAnswers());
    expect(result.outcome).toBe('eligible');
    expect(result.summary).toBe('Eligible - Low Risk');
    expect(result.effort).toBe('Low Effort');
  });

  describe('ineligible gates', () => {
    it.each([
      ['relationshipStatus is None of the above', { relationshipStatus: 'None of the above' }],
      ['either partner is under 18', { bothOver18: 'No' }],
      ['relationship is not exclusive', { exclusiveRelationship: 'No' }],
      ['sponsor is only visiting Australia', { sponsorResidencyStatus: 'Visiting Australia temporarily' }],
      ['sponsor previous sponsorship has not ended', { sponsorPreviouslySponsored: 'Yes', previousSponsorshipEnded: 'No' }],
      ['sponsor has sponsored 2 or more times', { sponsorPreviouslySponsored: 'Yes', previousSponsorshipEnded: 'Yes', previousSponsorshipCount: '2 or more' }],
      ['applicant still with previous PMV sponsor', { stillWithPMVSponsor: 'Yes' }],
    ])('ineligible when %s', (_desc, overrides) => {
      const result = engine.assess(baseAnswers(overrides));
      expect(result.outcome).toBe('ineligible');
      expect(result.summary).toBe('Ineligible');
    });

    it('ineligible when previous sponsorship was lodged within 5 years', () => {
      const recent = new Date();
      recent.setMonth(recent.getMonth() - 6);
      const result = engine.assess(
        baseAnswers({
          sponsorPreviouslySponsored: 'Yes',
          previousSponsorshipEnded: 'Yes',
          previousSponsorshipCount: '1',
          previousSponsorshipLodgedDate: recent.toISOString().slice(0, 10),
        }),
      );
      expect(result.outcome).toBe('ineligible');
    });
  });

  describe('high-risk flags', () => {
    it.each([
      ['visa issues (refusal/cancellation/overstay/breach)', { visaIssues: 'Yes' }],
      ['criminal offences', { criminalOffences: 'Yes' }],
      ['serious health conditions', { seriousHealthConditions: 'Yes' }],
      ['applicant lives in a high-risk country', { applicantCountry: 'Iran' }],
      ['non-substantive visa (e.g. bridging)', { substantiveVisa: 'No' }],
    ])('high risk when %s', (_desc, overrides) => {
      const result = engine.assess(baseAnswers(overrides));
      expect(result.highRisk).toBe(true);
      expect(result.summary).toContain('High Risk');
    });

    it('stays low risk on the happy path', () => {
      expect(engine.assess(baseAnswers()).highRisk).toBe(false);
    });
  });

  describe('effort level', () => {
    it('high effort when not comfortable with technology', () => {
      const result = engine.assess(baseAnswers({ techComfort: 'Not comfortable' }));
      expect(result.effort).toBe('High Effort');
      expect(result.outcome).toBe('high_effort');
    });

    it('high effort when an interpreter is needed', () => {
      const result = engine.assess(
        baseAnswers({ interpreterNeed: 'Yes, one of us has poor English' }),
      );
      expect(result.effort).toBe('High Effort');
    });

    it('medium effort with additional migrating family members', () => {
      const result = engine.assess(baseAnswers({ additionalMigratingMembers: '1' }));
      expect(result.effort).toBe('Medium Effort');
      expect(result.outcome).toBe('eligible');
    });
  });

  describe('becoming eligible', () => {
    it('flags a relationship younger than ~6 months', () => {
      const recent = new Date();
      recent.setMonth(recent.getMonth() - 2);
      const result = engine.assess(
        baseAnswers({ datingStartDate: recent.toISOString().slice(0, 10) }),
      );
      expect(result.becomingEligible).toBe(true);
      expect(result.summary).toContain('Becoming Eligible');
    });
  });
});
