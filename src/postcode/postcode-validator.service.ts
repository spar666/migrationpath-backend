import { Injectable, Logger } from '@nestjs/common';
import { REGIONAL_STUDY_POINTS } from '../points-engine/constants/points-catalogue';
import {
  RegionalPostcodeService,
  RegionBand,
} from '../regional-postcode/regional-postcode.service';

export type RegionalCategory =
  | 'METRO'
  | 'CATEGORY_2'
  | 'CATEGORY_3'
  | 'UNKNOWN';

export interface PostcodeClassification {
  postcode: string;
  isRegional: boolean;
  category: RegionalCategory;
  region: string | null;
  points: number;
  needsReview: boolean;
}

/**
 * Classifies a postcode against the admin-managed regional bands. The band data
 * now lives in the database (table regional_postcode_bands, managed from the
 * "Regional Postcodes" admin screen); this service reads a warm in-memory cache
 * so classification stays synchronous. If the table is empty it transparently
 * falls back to a static representative set, so classification never breaks.
 */
@Injectable()
export class PostcodeValidatorService {
  private readonly logger = new Logger(PostcodeValidatorService.name);

  constructor(private readonly regionalPostcodes: RegionalPostcodeService) {}

  validate(
    rawPostcode: string | number | null | undefined,
  ): PostcodeClassification {
    const postcode = this.normalize(rawPostcode);
    if (postcode === null) {
      return {
        postcode: String(rawPostcode ?? ''),
        isRegional: false,
        category: 'UNKNOWN',
        region: null,
        points: 0,
        needsReview: true,
      };
    }

    const bands = this.regionalPostcodes.getCachedBands();

    const metro = this.findBand(postcode, bands.metro);
    if (metro) {
      return { postcode: this.pad(postcode), isRegional: false, category: 'METRO', region: metro, points: 0, needsReview: false };
    }

    const cat2 = this.findBand(postcode, bands.cat2);
    if (cat2) {
      return { postcode: this.pad(postcode), isRegional: true, category: 'CATEGORY_2', region: cat2, points: REGIONAL_STUDY_POINTS, needsReview: false };
    }

    const cat3 = this.findBand(postcode, bands.cat3);
    if (cat3) {
      return { postcode: this.pad(postcode), isRegional: true, category: 'CATEGORY_3', region: cat3, points: REGIONAL_STUDY_POINTS, needsReview: false };
    }

    this.logger.warn(
      `Postcode ${this.pad(postcode)} is not in the regional lookup set — flagged needsReview.`,
    );
    return { postcode: this.pad(postcode), isRegional: false, category: 'UNKNOWN', region: null, points: 0, needsReview: true };
  }

  isRegional(postcode: string | number | null | undefined): boolean {
    return this.validate(postcode).isRegional;
  }

  private findBand(postcode: number, bands: RegionBand[]): string | null {
    for (const band of bands) {
      if (band.ranges.some(([from, to]) => postcode >= from && postcode <= to)) {
        return band.region;
      }
    }
    return null;
  }

  private normalize(raw: string | number | null | undefined): number | null {
    if (raw === null || raw === undefined) return null;
    const digits = String(raw).trim().replace(/\D/g, '');
    if (digits.length < 3 || digits.length > 4) return null;
    const value = parseInt(digits, 10);
    return Number.isNaN(value) ? null : value;
  }

  private pad(postcode: number): string {
    return postcode.toString().padStart(4, '0');
  }
}
