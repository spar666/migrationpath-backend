/**
 * Single source of truth for the structured GSM points test.
 *
 * Categories are strictly isolated (no free-form strings) and every points value
 * below mirrors the Department of Home Affairs points table for the General
 * Skilled Migration (subclass 189/190/491) points test. As with the occupation
 * lists, these are configuration: verify against Home Affairs (and ideally a
 * registered MARA agent) before each program-year change and edit here — the
 * seed migration and the aggregator both derive from this file, so there is one
 * place to change.
 *
 * The previous free-text "Above 8" English slider is intentionally gone. English
 * is now three discrete, legislated tiers keyed by attribute label.
 */

export enum PointsCategory {
  AGE = 'AGE',
  ENGLISH = 'ENGLISH',
  OVERSEAS_WORK = 'OVERSEAS_WORK',
  AUSTRALIAN_WORK = 'AUSTRALIAN_WORK',
  QUALIFICATIONS = 'QUALIFICATIONS',
  REGIONAL_STUDY = 'REGIONAL_STUDY',
}

/** English proficiency tiers (label match, not a numeric slider). */
export enum EnglishProficiency {
  COMPETENT = 'competent', // IELTS 6 / PTE 50 — visa entry baseline
  PROFICIENT = 'proficient', // IELTS 7 / PTE 65
  SUPERIOR = 'superior', // IELTS 8 / PTE 79
}

/** Recognised qualification tiers. */
export enum QualificationLevel {
  DOCTORATE = 'doctorate',
  BACHELOR_MASTERS = 'bachelor_masters',
  DIPLOMA_TRADE = 'diploma_trade',
  OTHER_RECOGNISED = 'other_recognised',
}

// ---- Legislative boundaries ----
/** Combined skilled employment (overseas + Australian) is capped at 20 points. */
export const COMBINED_WORK_POINTS_CAP = 20;
/** Points awarded for study in a designated regional area. */
export const REGIONAL_STUDY_POINTS = 5;
/** Current points pass mark for GSM invitation eligibility. */
export const GSM_PASS_MARK = 65;
/** Age ceiling for GSM subclasses (must be under 45 at invitation). */
export const GSM_MAX_AGE = 45;

export const DEFAULT_VISA_GROUP = 'GSM';

export interface PointsRuleSeed {
  visaGroup: string;
  category: PointsCategory;
  /** Discrete-choice categories (ENGLISH, QUALIFICATIONS, REGIONAL_STUDY). */
  attributeLabel: string | null;
  /** Range categories (AGE, OVERSEAS_WORK, AUSTRALIAN_WORK) — inclusive bounds. */
  minValue: number | null;
  maxValue: number | null;
  points: number;
}

/**
 * The canonical GSM points table. Seeded verbatim by the migration.
 */
export const STRUCTURED_POINTS_RULES: PointsRuleSeed[] = [
  // ---- AGE (inclusive year ranges) ----
  { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 18, maxValue: 24, points: 25 },
  { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 25, maxValue: 32, points: 30 },
  { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 33, maxValue: 39, points: 25 },
  { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 40, maxValue: 44, points: 15 },
  { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 45, maxValue: 120, points: 0 },

  // ---- ENGLISH (discrete tiers) ----
  { visaGroup: 'GSM', category: PointsCategory.ENGLISH, attributeLabel: EnglishProficiency.SUPERIOR, minValue: null, maxValue: null, points: 20 },
  { visaGroup: 'GSM', category: PointsCategory.ENGLISH, attributeLabel: EnglishProficiency.PROFICIENT, minValue: null, maxValue: null, points: 10 },
  { visaGroup: 'GSM', category: PointsCategory.ENGLISH, attributeLabel: EnglishProficiency.COMPETENT, minValue: null, maxValue: null, points: 0 },

  // ---- OVERSEAS_WORK (years in last 10) ----
  { visaGroup: 'GSM', category: PointsCategory.OVERSEAS_WORK, attributeLabel: null, minValue: 0, maxValue: 2, points: 0 },
  { visaGroup: 'GSM', category: PointsCategory.OVERSEAS_WORK, attributeLabel: null, minValue: 3, maxValue: 4, points: 5 },
  { visaGroup: 'GSM', category: PointsCategory.OVERSEAS_WORK, attributeLabel: null, minValue: 5, maxValue: 7, points: 10 },
  { visaGroup: 'GSM', category: PointsCategory.OVERSEAS_WORK, attributeLabel: null, minValue: 8, maxValue: 120, points: 15 },

  // ---- AUSTRALIAN_WORK (years in last 10) ----
  { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 0, maxValue: 0, points: 0 },
  { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 1, maxValue: 2, points: 5 },
  { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 3, maxValue: 4, points: 10 },
  { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 5, maxValue: 7, points: 15 },
  { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 8, maxValue: 120, points: 20 },

  // ---- QUALIFICATIONS (discrete tiers) ----
  { visaGroup: 'GSM', category: PointsCategory.QUALIFICATIONS, attributeLabel: QualificationLevel.DOCTORATE, minValue: null, maxValue: null, points: 20 },
  { visaGroup: 'GSM', category: PointsCategory.QUALIFICATIONS, attributeLabel: QualificationLevel.BACHELOR_MASTERS, minValue: null, maxValue: null, points: 15 },
  { visaGroup: 'GSM', category: PointsCategory.QUALIFICATIONS, attributeLabel: QualificationLevel.DIPLOMA_TRADE, minValue: null, maxValue: null, points: 10 },
  { visaGroup: 'GSM', category: PointsCategory.QUALIFICATIONS, attributeLabel: QualificationLevel.OTHER_RECOGNISED, minValue: null, maxValue: null, points: 10 },

  // ---- REGIONAL_STUDY ----
  { visaGroup: 'GSM', category: PointsCategory.REGIONAL_STUDY, attributeLabel: 'regional', minValue: null, maxValue: null, points: REGIONAL_STUDY_POINTS },
];

/** All structured categories, for idempotent (re)seeding. */
export const STRUCTURED_CATEGORY_KEYS = Object.values(PointsCategory);
