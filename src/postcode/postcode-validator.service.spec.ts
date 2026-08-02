import { Test, TestingModule } from '@nestjs/testing';
import { PostcodeValidatorService } from './postcode-validator.service';
import { RegionalPostcodeService } from '../regional-postcode/regional-postcode.service';
import { REGIONAL_STUDY_POINTS } from '../points-engine/constants/points-catalogue';

/**
 * Postcode classification.
 *
 * Small surface, outsized consequences: this decides whether someone is
 * "regional", which changes their points, which changes which visas they are
 * told they qualify for. A wrong answer here is not a cosmetic bug — it is a
 * person being told they are eligible when they are not.
 *
 * The two behaviours worth guarding are precedence (metro wins over regional,
 * so a metro postcode inside a regional band cannot leak points) and the
 * unknown path (never guess; flag for review).
 */

const BANDS = {
  metro: [
    { region: 'Sydney', ranges: [[2000, 2249] as [number, number]] },
    { region: 'Melbourne', ranges: [[3000, 3207] as [number, number]] },
  ],
  cat2: [
    {
      region: 'Perth',
      ranges: [[6000, 6214] as [number, number]],
    },
  ],
  cat3: [
    {
      region: 'Regional NSW',
      ranges: [
        [2250, 2299] as [number, number],
        [2500, 2599] as [number, number],
      ],
    },
  ],
};

describe('PostcodeValidatorService', () => {
  let service: PostcodeValidatorService;
  let bands: typeof BANDS;

  beforeEach(async () => {
    bands = JSON.parse(JSON.stringify(BANDS));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostcodeValidatorService,
        {
          provide: RegionalPostcodeService,
          useValue: { getCachedBands: () => bands },
        },
      ],
    }).compile();

    service = module.get(PostcodeValidatorService);
  });

  describe('metro', () => {
    it('classifies a metro postcode as not regional, worth no points', () => {
      const result = service.validate('2000');
      expect(result).toMatchObject({
        isRegional: false,
        category: 'METRO',
        region: 'Sydney',
        points: 0,
        needsReview: false,
      });
    });

    it('includes both ends of a band', () => {
      // Off-by-one at a band boundary is the classic failure, and it is
      // invisible until someone on exactly that postcode complains.
      expect(service.validate('2000').category).toBe('METRO');
      expect(service.validate('2249').category).toBe('METRO');
    });

    it('excludes the postcode just past the end', () => {
      expect(service.validate('2250').category).not.toBe('METRO');
    });
  });

  describe('regional', () => {
    it('awards points for a category 2 postcode', () => {
      const result = service.validate('6000');
      expect(result).toMatchObject({
        isRegional: true,
        category: 'CATEGORY_2',
        region: 'Perth',
        points: REGIONAL_STUDY_POINTS,
      });
    });

    it('awards points for a category 3 postcode', () => {
      const result = service.validate('2500');
      expect(result).toMatchObject({
        isRegional: true,
        category: 'CATEGORY_3',
        points: REGIONAL_STUDY_POINTS,
      });
    });

    it('matches any range within a band, not just the first', () => {
      // Regional NSW is two disjoint ranges. Checking only the first would
      // silently misclassify the second.
      expect(service.validate('2260').category).toBe('CATEGORY_3');
      expect(service.validate('2550').category).toBe('CATEGORY_3');
    });
  });

  describe('precedence', () => {
    it('lets metro win when a postcode sits in both a metro and a regional band', () => {
      // Overlapping bands are a data-entry mistake an admin can make from the
      // Regional Postcodes screen. When it happens, the safe answer is the one
      // that does NOT hand out points.
      bands.cat3.push({ region: 'Overlapping', ranges: [[2000, 2100]] });

      const result = service.validate('2000');
      expect(result.category).toBe('METRO');
      expect(result.points).toBe(0);
    });

    it('lets category 2 win over category 3', () => {
      bands.cat3.push({ region: 'Also Perth', ranges: [[6000, 6100]] });
      expect(service.validate('6000').category).toBe('CATEGORY_2');
    });
  });

  describe('input handling', () => {
    it('accepts a number as readily as a string', () => {
      expect(service.validate(2000).category).toBe('METRO');
    });

    it('pads a three-digit postcode to four', () => {
      // NT postcodes like 0800 arrive as 800 from spreadsheets and JSON that
      // dropped the leading zero.
      bands.cat3.push({ region: 'Darwin', ranges: [[800, 899]] });
      const result = service.validate(800);
      expect(result.postcode).toBe('0800');
      expect(result.category).toBe('CATEGORY_3');
    });

    it('strips surrounding whitespace and stray non-digits', () => {
      expect(service.validate(' 2000 ').category).toBe('METRO');
      expect(service.validate('NSW 2000').category).toBe('METRO');
    });

    it.each([null, undefined, '', 'abcd', '12', '123456'])(
      'flags %s for review rather than guessing',
      (input) => {
        const result = service.validate(input);
        expect(result.category).toBe('UNKNOWN');
        expect(result.needsReview).toBe(true);
        expect(result.points).toBe(0);
        expect(result.isRegional).toBe(false);
      },
    );

    it('echoes back what it was given when it cannot parse it', () => {
      // So the agent reviewing the flag can see what the person actually typed.
      expect(service.validate('rubbish').postcode).toBe('rubbish');
    });
  });

  describe('unknown postcodes', () => {
    it('is flagged for review, not silently treated as metro', () => {
      // 9999 is in no band. Defaulting it to metro would quietly deny points;
      // defaulting it to regional would quietly grant them. Neither is safe,
      // so it goes to a human.
      const result = service.validate('9999');
      expect(result).toMatchObject({
        category: 'UNKNOWN',
        needsReview: true,
        isRegional: false,
        points: 0,
        region: null,
      });
    });

    it('still returns a normalised postcode for the reviewer', () => {
      expect(service.validate('9999').postcode).toBe('9999');
    });
  });

  describe('empty band data', () => {
    it('flags everything for review rather than crashing', () => {
      // The bands live in a database table an admin can empty.
      bands.metro = [];
      bands.cat2 = [];
      bands.cat3 = [];

      const result = service.validate('2000');
      expect(result.category).toBe('UNKNOWN');
      expect(result.needsReview).toBe(true);
    });
  });

  describe('isRegional shorthand', () => {
    it('agrees with validate()', () => {
      expect(service.isRegional('2500')).toBe(true);
      expect(service.isRegional('2000')).toBe(false);
      expect(service.isRegional('9999')).toBe(false);
      expect(service.isRegional(null)).toBe(false);
    });
  });
});
