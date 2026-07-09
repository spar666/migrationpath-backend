/**
 * Single source of truth for the "skilled list -> eligible visa subclasses"
 * legislative mapping.
 *
 * IMPORTANT (maintainers read this): Australian skilled-migration occupation
 * lists change frequently and materially. The CSOL + Skills in Demand (subclass
 * 482) framework was introduced on 7 December 2024 and the legacy MLTSSL / STSOL
 * / ROL lists still coexist alongside it. Because this platform surfaces
 * eligibility to real applicants, treat the matrix below as configuration, not
 * as settled law: it should be validated against the Department of Home Affairs
 * and (ideally) a registered MARA agent before each program-year change, and
 * updated here in ONE place. Every service and migration derives from this
 * constant, so a correction is a one-line edit.
 *
 * Known simplifications baked into the current values (deliberate, per product spec):
 *  - An occupation can appear on more than one list in reality (e.g. both MLTSSL
 *    and CSOL). `primary_list` stores a single classifying list; if you later need
 *    to express membership of multiple lists, promote it to a list[] and union the
 *    matrix results in resolveEligibleSubclasses().
 *  - Subclass 485 (Temporary Graduate) is included under MLTSSL for continuity with
 *    the legacy Graduate Work stream. Post-2024 the 485 is largely no longer gated
 *    on an occupation list; confirm before relying on it.
 */

export enum SkilledList {
  MLTSSL = 'MLTSSL', // Medium and Long-term Strategic Skills List
  STSOL = 'STSOL', // Short-term Skilled Occupation List
  ROL = 'ROL', // Regional Occupation List
  CSOL = 'CSOL', // Core Skills Occupation List (Skills in Demand framework)
}

export enum VisaResidencyType {
  PERMANENT = 'permanent',
  PROVISIONAL = 'provisional',
  TEMPORARY = 'temporary',
}

/**
 * The canonical visa reference data. Seeded by the migration and used by
 * OccupationsService.syncVisas() to resolve subclass numbers -> visa rows.
 * Subclass numbers are stored as strings so codes like '482' are never coerced.
 */
export interface VisaSeed {
  subclassNumber: string;
  streamTitle: string;
  residencyType: VisaResidencyType;
  name: string;
}

export const VISA_CATALOGUE: VisaSeed[] = [
  {
    subclassNumber: '189',
    streamTitle: 'Points-tested',
    residencyType: VisaResidencyType.PERMANENT,
    name: 'Skilled Independent',
  },
  {
    subclassNumber: '190',
    streamTitle: 'State/Territory Nominated',
    residencyType: VisaResidencyType.PERMANENT,
    name: 'Skilled Nominated',
  },
  {
    subclassNumber: '491',
    streamTitle: 'State/Territory or Family Sponsored',
    residencyType: VisaResidencyType.PROVISIONAL,
    name: 'Skilled Work Regional (Provisional)',
  },
  {
    subclassNumber: '485',
    streamTitle: 'Graduate Work',
    residencyType: VisaResidencyType.TEMPORARY,
    name: 'Temporary Graduate',
  },
  {
    subclassNumber: '494',
    streamTitle: 'Employer Sponsored',
    residencyType: VisaResidencyType.PROVISIONAL,
    name: 'Skilled Employer Sponsored Regional (Provisional)',
  },
  {
    subclassNumber: '482',
    streamTitle: 'Core Skills',
    residencyType: VisaResidencyType.TEMPORARY,
    name: 'Skills in Demand',
  },
  {
    subclassNumber: '186',
    streamTitle: 'Direct Entry',
    residencyType: VisaResidencyType.PERMANENT,
    name: 'Employer Nomination Scheme',
  },
];

/**
 * The legislative mapping. Keyed by skilled list, values are visa subclass
 * numbers (strings, matching VISA_CATALOGUE.subclassNumber).
 */
export const SKILLED_LIST_VISA_MATRIX: Record<SkilledList, string[]> = {
  [SkilledList.MLTSSL]: ['189', '190', '491', '485'],
  [SkilledList.STSOL]: ['190', '491'],
  [SkilledList.ROL]: ['491', '494'],
  [SkilledList.CSOL]: ['482', '186'],
};

/**
 * Resolve the set of eligible visa subclass numbers for a given primary list.
 * Returns an empty array when the occupation has no classified list. Written to
 * accept a list array in future without touching call sites.
 */
export function resolveEligibleSubclasses(
  primaryList: SkilledList | null | undefined,
): string[] {
  if (!primaryList) return [];
  const subclasses = SKILLED_LIST_VISA_MATRIX[primaryList];
  return subclasses ? [...subclasses] : [];
}
