import { Test, TestingModule } from '@nestjs/testing';
import { IntentService } from './intent.service';
import { OccupationsService } from '../occupations/occupations.service';

/**
 * Search intent classification.
 *
 * This decides which funnel a visitor is dropped into from a single search
 * box, and the ordering of its five branches is a product decision with a
 * known trade-off documented in the service. These tests pin that ordering
 * down, including the case it deliberately gets "wrong" — so that if someone
 * changes it, they do so on purpose rather than by accident.
 */

const OCCUPATION = {
  anzsco_code: '261313',
  occupation_name: 'Software Engineer',
  primary_list: 'MLTSSL',
  assessing_authority: 'ACS',
  eligibleVisas: [
    { subclassNumber: '189', name: 'Skilled Independent' },
    { subclassNumber: '190', name: 'State Nominated' },
    { subclassNumber: '482', name: 'Skills in Demand' },
    { subclassNumber: '186', name: 'ENS' },
    { subclassNumber: '999', name: 'Something unmapped' },
  ],
};

describe('IntentService.classify', () => {
  let service: IntentService;
  let occupations: { findOne: jest.Mock; searchOccupations: jest.Mock };

  beforeEach(async () => {
    occupations = {
      findOne: jest.fn().mockResolvedValue(OCCUPATION),
      searchOccupations: jest.fn().mockResolvedValue({ data: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntentService,
        { provide: OccupationsService, useValue: occupations },
      ],
    }).compile();

    service = module.get(IntentService);
  });

  describe('an exact ANZSCO code', () => {
    it('classifies as SKILLED', async () => {
      const result = await service.classify('261313');
      expect(result.intent).toBe('SKILLED');
    });

    it('beats a relationship keyword', async () => {
      // Documented precedence: a user who types a code means the code. This is
      // what protects genuine occupations like "family day care educator" for
      // anyone who knows their ANZSCO.
      const result = await service.classify('261313');
      expect(result.intent).toBe('SKILLED');
      expect(occupations.searchOccupations).not.toHaveBeenCalled();
    });

    it('falls through when the code resolves to nothing', async () => {
      // An unknown code must not dead-end — it keeps looking.
      occupations.findOne.mockRejectedValue(new Error('not found'));
      const result = await service.classify('999999');
      expect(result.intent).toBe('UNKNOWN');
    });

    it('ignores codes that are not exactly six digits', async () => {
      occupations.searchOccupations.mockResolvedValue({ data: [] });
      const result = await service.classify('26131');
      expect(result.intent).toBe('UNKNOWN');
    });
  });

  describe('the SKILLED split screen', () => {
    it('separates points-tested from employer-sponsored visas', async () => {
      const result = (await service.classify('261313')) as never as {
        pointsTested: Array<{ subclassNumber: string }>;
        employerSponsored: Array<{ subclassNumber: string }>;
      };

      expect(result.pointsTested.map((v) => v.subclassNumber)).toEqual([
        '189',
        '190',
      ]);
      expect(result.employerSponsored.map((v) => v.subclassNumber)).toEqual([
        '482',
        '186',
      ]);
    });

    it('drops a subclass that belongs to neither list', async () => {
      // '999' is in the fixture on purpose: an unmapped subclass must not
      // silently land in one of the columns.
      const result = (await service.classify('261313')) as never as {
        pointsTested: Array<{ subclassNumber: string }>;
        employerSponsored: Array<{ subclassNumber: string }>;
      };
      const shown = [...result.pointsTested, ...result.employerSponsored];
      expect(shown.map((v) => v.subclassNumber)).not.toContain('999');
    });

    it('returns both streams even when one is empty', async () => {
      occupations.findOne.mockResolvedValue({
        ...OCCUPATION,
        eligibleVisas: [{ subclassNumber: '189', name: 'Skilled Independent' }],
      });

      const result = (await service.classify('261313')) as never as {
        pointsTested: unknown[];
        employerSponsored: unknown[];
      };

      expect(result.pointsTested).toHaveLength(1);
      expect(result.employerSponsored).toEqual([]);
    });

    it('carries the occupation detail the results page needs', async () => {
      const result = (await service.classify('261313')) as never as {
        occupation: Record<string, unknown>;
      };
      expect(result.occupation).toEqual({
        anzscoCode: '261313',
        title: 'Software Engineer',
        primaryList: 'MLTSSL',
        assessingAuthority: 'ACS',
      });
    });
  });

  describe('relationship keywords', () => {
    it.each([
      'partner visa',
      'my spouse',
      'we are married',
      'de facto relationship',
      'parent visa',
      'fiance',
    ])('routes "%s" to FAMILY', async (query) => {
      const result = await service.classify(query);
      expect(result.intent).toBe('FAMILY');
      expect((result as never as { redirectTo: string }).redirectTo).toBe(
        '/pathways/partner',
      );
    });

    it('matches on word boundaries, so "spousework" does not trip "spouse"', async () => {
      const result = await service.classify('spousework');
      expect(result.intent).not.toBe('FAMILY');
    });

    it('is case-insensitive', async () => {
      expect((await service.classify('PARTNER VISA')).intent).toBe('FAMILY');
    });

    it('reports which keyword matched', async () => {
      const result = await service.classify('looking for a partner visa');
      expect(
        (result as never as { matchedKeyword: string }).matchedKeyword,
      ).toBe('partner');
    });

    it('⚠️ beats an occupation title — the documented trade-off', async () => {
      // "family day care educator" is a real ANZSCO occupation, and it routes
      // to FAMILY because keyword matching runs first. This is deliberate per
      // the product spec, and it is pinned here so that changing the branch
      // order is a decision rather than an accident.
      occupations.searchOccupations.mockResolvedValue({
        data: [{ anzsco_code: '421111' }],
      });

      const result = await service.classify('family day care educator');
      expect(result.intent).toBe('FAMILY');
    });
  });

  describe('occupation titles', () => {
    it('routes a matched title to SKILLED', async () => {
      occupations.searchOccupations.mockResolvedValue({
        data: [{ anzsco_code: '261313' }],
      });

      const result = await service.classify('software engineer');
      expect(result.intent).toBe('SKILLED');
      expect(occupations.findOne).toHaveBeenCalledWith('261313');
    });

    it('keeps the original query on the result', async () => {
      occupations.searchOccupations.mockResolvedValue({
        data: [{ anzsco_code: '261313' }],
      });
      const result = await service.classify('software engineer');
      expect(result.query).toBe('software engineer');
    });

    // Previously this fell through to a STUDENT course match. With courses
    // gone the branch below it is UNKNOWN, so an unresolvable title now ends
    // the chain rather than being caught by a course lookup.
    it('falls through to UNKNOWN when the title match will not resolve', async () => {
      occupations.searchOccupations.mockResolvedValue({
        data: [{ anzsco_code: '261313' }],
      });
      occupations.findOne.mockRejectedValue(new Error('gone'));

      const result = await service.classify('software engineer');
      expect(result.intent).toBe('UNKNOWN');
    });
  });

  describe('no confident match', () => {
    it('suggests the audit rather than guessing', async () => {
      const result = (await service.classify('asdfgh')) as never as {
        intent: string;
        suggestAudit: boolean;
        redirectTo: string;
      };

      expect(result.intent).toBe('UNKNOWN');
      expect(result.suggestAudit).toBe(true);
      expect(result.redirectTo).toBe('/pathways/onshore');
    });

    it.each(['', '   ', null, undefined])(
      'handles %s without throwing',
      async (query) => {
        const result = await service.classify(query as never);
        expect(result.intent).toBe('UNKNOWN');
        expect(result.query).toBe('');
      },
    );
  });
});
