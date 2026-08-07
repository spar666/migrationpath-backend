/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ============================================================================
 *  ⚠️  PLACEHOLDER VALUES — NOT AUTHORITATIVE — DO NOT GO LIVE ON THESE  ⚠️
 * ============================================================================
 *
 * Every figure in this file is a plausible-looking placeholder written to make
 * the engine runnable. None of it has been checked against current Department
 * of Home Affairs policy, and several of these numbers are indexed annually
 * (typically 1 July) or change at short notice by legislative instrument.
 *
 * A MARA-registered agent MUST set the real values and sign off on this file
 * before the funnel takes a single booking. An inaccurate pre-screen does not
 * just mislead the prospect — it mis-triages your own pipeline, so you spend
 * consult hours on people who were never eligible and turn away people who
 * were.
 *
 * GO-LIVE CHECKLIST (tick every line, then delete this block):
 *   [ ] CORE_SKILLS_INCOME_THRESHOLD  — verify against the current TSMIT /
 *       core skills income threshold instrument. Indexed annually.
 *   [ ] SPECIALIST_SKILLS_INCOME_THRESHOLD — same instrument, higher stream.
 *   [ ] SUBCLASS_RULES                — age caps, experience, stream names and
 *       whether each subclass still exists in its current form.
 *   [ ] ENGLISH_REQUIREMENTS          — IELTS/PTE equivalents per subclass.
 *   [ ] OCCUPATION_LIST_NAMES         — list names change with the skilled
 *       occupation list instruments.
 *   [ ] occupation_listed             — WIRE TO THE REAL `occupations` MODULE.
 *       Right now the engine trusts a checkbox on the form. A prospect ticking
 *       "yes my occupation is on the list" is not evidence. See the note on
 *       OccupationListCheck below.
 *   [ ] CLIENT_FIT                    — this is commercial policy, not law.
 *       It is yours to set. The defaults below are a guess at a small agency.
 *
 * None of this is legal advice and none of it is a substitute for an agent
 * reading the current instruments.
 */

/**
 * Minimum guaranteed annual earnings (AUD, excluding superannuation) for the
 * core skills stream.
 *
 * ⚠️ PLACEHOLDER. Indexed annually — check the current instrument.
 */
export const CORE_SKILLS_INCOME_THRESHOLD = 73_150;

/**
 * Minimum guaranteed annual earnings (AUD, excluding superannuation) for the
 * specialist skills stream.
 *
 * ⚠️ PLACEHOLDER. Indexed annually — check the current instrument.
 */
export const SPECIALIST_SKILLS_INCOME_THRESHOLD = 135_000;

/**
 * Below this, a role is unlikely to clear the market salary rate test even if
 * it clears the statutory floor. Used as a soft warning, not a hard fail.
 *
 * ⚠️ PLACEHOLDER.
 */
export const MARKET_RATE_WARNING_MARGIN = 0.9;

export interface SubclassRule {
  /** Display name for the result screen. */
  label: string;
  /** Hard age ceiling at time of application; null = no age cap. */
  maxAge: number | null;
  /** Minimum years of relevant work experience. */
  minYearsExperience: number;
  /** Minimum salary the nominated role must guarantee. */
  minSalary: number;
  /** Minimum IELTS-equivalent overall band. */
  minEnglishOverall: number;
  /** Minimum IELTS-equivalent band in each component. */
  minEnglishPerBand: number;
  /** Whether the role must sit in a designated regional area. */
  requiresRegional: boolean;
  /** Whether Labour Market Testing must be completed before nomination. */
  requiresLmt: boolean;
  /** Named occupation list(s) this subclass draws from. */
  occupationLists: string[];
  /** Leads to permanent residence directly, or only via a later pathway. */
  permanentResidence: 'direct' | 'pathway' | 'none';
}

/**
 * ⚠️ PLACEHOLDER RULE SET. Structure is right; numbers are not verified.
 * Subclass rules change by legislative instrument, sometimes mid-year.
 */
export const SUBCLASS_RULES: Record<string, SubclassRule> = {
  '482': {
    label: 'Skills in Demand (subclass 482)',
    maxAge: null,
    minYearsExperience: 1,
    minSalary: CORE_SKILLS_INCOME_THRESHOLD,
    minEnglishOverall: 5.0,
    minEnglishPerBand: 5.0,
    requiresRegional: false,
    requiresLmt: true,
    occupationLists: ['CSOL'],
    permanentResidence: 'pathway',
  },
  '186': {
    label: 'Employer Nomination Scheme (subclass 186)',
    maxAge: 45,
    minYearsExperience: 3,
    minSalary: CORE_SKILLS_INCOME_THRESHOLD,
    minEnglishOverall: 6.0,
    minEnglishPerBand: 6.0,
    requiresRegional: false,
    requiresLmt: true,
    occupationLists: ['CSOL'],
    permanentResidence: 'direct',
  },
  '494': {
    label: 'Skilled Employer Sponsored Regional (subclass 494)',
    maxAge: 45,
    minYearsExperience: 3,
    minSalary: CORE_SKILLS_INCOME_THRESHOLD,
    minEnglishOverall: 5.0,
    minEnglishPerBand: 5.0,
    requiresRegional: true,
    requiresLmt: true,
    occupationLists: ['CSOL', 'ROL'],
    permanentResidence: 'pathway',
  },
};

/** Subclasses the engine will consider, in the order it prefers them. */
export const CONSIDERED_SUBCLASSES = ['186', '494', '482'];

/**
 * ⚠️ PLACEHOLDER. Named occupation lists referenced by SUBCLASS_RULES.
 * List names and membership change with each instrument.
 */
export const OCCUPATION_LIST_NAMES = {
  CSOL: 'Core Skills Occupation List',
  ROL: 'Regional Occupation List',
} as const;

/**
 * ⚠️ CRITICAL WIRING GAP.
 *
 * The engine currently determines "is this occupation on the list" from an
 * answer the prospect gave on the form. That is worthless as evidence — the
 * prospect does not know, and has an incentive to guess yes.
 *
 * Before go-live, replace the form answer with a lookup against the real
 * `occupations` module (src/occupations), keyed on ANZSCO code, returning
 * which named lists the occupation appears on for the relevant subclass.
 * The engine already accepts an injected checker with this shape so the swap
 * is a one-line change in EmployerSponsoredEngine.
 */
export type OccupationListCheck = (
  occupationCode: string | undefined,
  requiredLists: string[],
) => Promise<boolean | null> | boolean | null;

/**
 * Sponsor-side thresholds. ⚠️ PLACEHOLDER — commercial and policy mix.
 */
export const SPONSOR_RULES = {
  /** Businesses trading for less than this are materially harder to sponsor. */
  minYearsTradingForStandard: 1,
  /** Below this headcount, expect extra scrutiny of the genuine-position test. */
  smallBusinessHeadcount: 5,
};

// ---------------------------------------------------------------------------
// Client fit — COMMERCIAL POLICY, NOT LAW
// ---------------------------------------------------------------------------

/**
 * ⚠️ THIS IS YOUR BUSINESS POLICY. Tune it; it is not a legal question.
 *
 * `statutory_eligible` asks "do they meet the rules". `client_fit` asks
 * "do we want this file". They are separate on purpose: plenty of eligible
 * people are bad clients (no budget, unrealistic timeline, a vertical you
 * don't service) and the funnel should route them differently rather than
 * booking a paid consult that ends in a refund conversation.
 */
export const CLIENT_FIT = {
  /** Roles paying under this rarely support the agency's fee structure. */
  minSalaryOfInterest: 70_000,
  /** Sponsors with no ABN are typically too early to help commercially. */
  requireAbnForBusiness: true,
  /** Subclasses the practice actually services. */
  servicedSubclasses: ['482', '186', '494'],
  /** Above this age the 186/494 age bar makes most files unworkable. */
  hardAgeCeiling: 50,
};

export interface ClientFitInput {
  party: 'applicant' | 'business';
  age?: number;
  annualSalary?: number;
  subclass?: string;
  hasAbn?: boolean;
  statutoryEligible: boolean;
}

export interface ClientFitResult {
  fit: boolean;
  reasons: string[];
}

/**
 * ⚠️ TUNE THIS. Deliberately conservative and deliberately simple so the
 * rules are readable by a non-engineer at the agency.
 *
 * Note it does NOT hard-require statutory eligibility: a near-miss applicant
 * who is otherwise a strong commercial fit is often worth a conversation
 * about a different pathway. That is a policy choice — change it if the
 * practice would rather not have those calls.
 */
export function computeClientFit(input: ClientFitInput): ClientFitResult {
  const reasons: string[] = [];
  let fit = true;

  if (
    input.subclass &&
    !CLIENT_FIT.servicedSubclasses.includes(input.subclass)
  ) {
    fit = false;
    reasons.push(
      `We do not currently service subclass ${input.subclass} matters.`,
    );
  }

  if (
    typeof input.annualSalary === 'number' &&
    input.annualSalary > 0 &&
    input.annualSalary < CLIENT_FIT.minSalaryOfInterest
  ) {
    fit = false;
    reasons.push(
      'The nominated salary is below the level at which this pathway is ' +
        'usually commercially viable for the applicant.',
    );
  }

  if (typeof input.age === 'number' && input.age > CLIENT_FIT.hardAgeCeiling) {
    fit = false;
    reasons.push(
      'Age places the main employer-sponsored permanent pathways out of reach.',
    );
  }

  if (
    input.party === 'business' &&
    CLIENT_FIT.requireAbnForBusiness &&
    !input.hasAbn
  ) {
    fit = false;
    reasons.push(
      'No ABN was provided, so the business is likely too early in its ' +
        'set-up for a sponsorship engagement.',
    );
  }

  if (fit && !input.statutoryEligible) {
    reasons.push(
      'Not currently eligible, but close enough that an alternative pathway ' +
        'is worth discussing.',
    );
  }

  return { fit, reasons };
}
