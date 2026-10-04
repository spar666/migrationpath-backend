import { Injectable, Logger } from '@nestjs/common';
import {
  OccupationsService,
  EligibleVisa,
} from '../occupations/occupations.service';

export type MigrationIntent = 'SKILLED' | 'FAMILY' | 'UNKNOWN';

export interface SkilledIntentResult {
  intent: 'SKILLED';
  query: string;
  occupation: {
    anzscoCode: string;
    title: string;
    lists: string[];
    assessingAuthority: string | null;
  };
  /** Split-screen: both streams are always returned (either may be empty). */
  pointsTested: EligibleVisa[];
  employerSponsored: EligibleVisa[];
}

export interface FamilyIntentResult {
  intent: 'FAMILY';
  query: string;
  matchedKeyword: string;
  /** Frontend should redirect here (the relationship form engine). */
  redirectTo: string;
}

export interface UnknownIntentResult {
  intent: 'UNKNOWN';
  query: string;
  /** No confident classification — frontend should fall back to the audit. */
  suggestAudit: true;
  redirectTo: string;
}

export type IntentResult =
  | SkilledIntentResult
  | FamilyIntentResult
  | UnknownIntentResult;

/**
 * ---- Tuning constants (single source of truth) ----
 *
 * Which visa subclasses belong to each side of the SKILLED split-screen.
 * Derived from the same legislative framework as occupations/constants/visa-mapping.ts.
 */
const POINTS_TESTED_SUBCLASSES = new Set(['189', '190', '491', '485']);
const EMPLOYER_SPONSORED_SUBCLASSES = new Set(['482', '186', '494']);

/**
 * Relationship keywords that route to the FAMILY funnel.
 *
 * Ordering note: FAMILY keyword detection runs BEFORE fuzzy occupation-title
 * matching (per product spec: relationship keywords -> FAMILY). The trade-off is
 * that a query like "family day care educator" — which is a genuine ANZSCO
 * occupation — will resolve to FAMILY because it contains "family". Exact 6-digit
 * ANZSCO codes are always classified SKILLED first, so a user who enters the code
 * is unaffected. If you would rather occupation matches win over keywords, move
 * the resolveOccupation() branch above resolveFamily() in classify().
 */
const RELATIONSHIP_KEYWORDS = [
  'partner',
  'spouse',
  'married',
  'marriage',
  'de facto',
  'parent',
  'family',
  'fiance',
  'fiancé',
];

const FAMILY_REDIRECT = '/pathways/partner';
const AUDIT_REDIRECT = '/pathways/onshore';

@Injectable()
export class IntentService {
  private readonly logger = new Logger(IntentService.name);

  constructor(private readonly occupationsService: OccupationsService) {}

  async classify(rawQuery: string): Promise<IntentResult> {
    const query = (rawQuery ?? '').trim();
    const lower = query.toLowerCase();

    // 1. Exact 6-digit ANZSCO code always wins.
    if (/^\d{6}$/.test(query)) {
      const skilled = await this.resolveSkilled(query, query);
      if (skilled) return skilled;
    }

    // 2. Relationship keywords -> FAMILY (see ordering note above).
    const matchedKeyword = this.matchRelationshipKeyword(lower);
    if (matchedKeyword) {
      return {
        intent: 'FAMILY',
        query,
        matchedKeyword,
        redirectTo: FAMILY_REDIRECT,
      };
    }

    // 3. Occupation (job title) match -> SKILLED.
    const occupationMatch = await this.findOccupationByTitle(query);
    if (occupationMatch) {
      const skilled = await this.resolveSkilled(
        occupationMatch.anzsco_code,
        query,
      );
      if (skilled) return skilled;
    }

    // 4. No confident classification.
    //
    // STUDENT used to sit here: a course/university/degree match returned a
    // course list. It went with the courses module — with no course table there
    // is nothing to match on, so those queries now fall through to UNKNOWN.
    return {
      intent: 'UNKNOWN',
      query,
      suggestAudit: true,
      redirectTo: AUDIT_REDIRECT,
    };
  }

  private matchRelationshipKeyword(lowerQuery: string): string | null {
    for (const keyword of RELATIONSHIP_KEYWORDS) {
      // Word-boundary match so "spousework" doesn't trip "spouse".
      const pattern = new RegExp(`(^|\\W)${this.escapeRegex(keyword)}(\\W|$)`);
      if (pattern.test(lowerQuery)) return keyword;
    }
    return null;
  }

  private async findOccupationByTitle(
    query: string,
  ): Promise<{ anzsco_code: string } | null> {
    const { data } = await this.occupationsService.searchOccupations({
      q: query,
      page: 1,
      limit: 1,
    });
    if (Array.isArray(data) && data.length > 0 && data[0]?.anzsco_code) {
      return { anzsco_code: data[0].anzsco_code };
    }
    return null;
  }

  /**
   * Build the SKILLED split-screen payload straight from occupation_visas.
   * Returns null if the occupation cannot be found (so the caller can fall
   * through to other intents).
   */
  private async resolveSkilled(
    anzscoCode: string,
    query: string,
  ): Promise<SkilledIntentResult | null> {
    try {
      const occupation = await this.occupationsService.findOne(anzscoCode);

      const pointsTested = occupation.eligibleVisas.filter((v) =>
        POINTS_TESTED_SUBCLASSES.has(v.subclassNumber),
      );
      const employerSponsored = occupation.eligibleVisas.filter((v) =>
        EMPLOYER_SPONSORED_SUBCLASSES.has(v.subclassNumber),
      );

      return {
        intent: 'SKILLED',
        query,
        occupation: {
          anzscoCode: occupation.anzsco_code,
          title: occupation.occupation_name,
          lists: occupation.listMemberships?.map(m => m.list_code) ?? [],
          assessingAuthority: occupation.assessing_authority,
        },
        pointsTested,
        employerSponsored,
      };
    } catch (error) {
      this.logger.warn(
        `resolveSkilled: occupation "${anzscoCode}" not resolvable (${
          (error as Error).message
        })`,
      );
      return null;
    }
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
