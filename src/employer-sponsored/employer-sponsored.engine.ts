import { Injectable, Logger } from '@nestjs/common';
import {
  CONSIDERED_SUBCLASSES,
  MARKET_RATE_WARNING_MARGIN,
  OccupationListCheck,
  SPONSOR_RULES,
  SUBCLASS_RULES,
  SubclassRule,
  computeClientFit,
} from './constants/employer-sponsored.config';

/**
 * What the applicant side of the questionnaire produces.
 * Every field is optional — a pre-screen is allowed to be incomplete, and
 * "we don't know yet" must be distinguishable from "no".
 */
export interface ApplicantFacts {
  age?: number;
  occupation_code?: string;
  occupation_name?: string;
  /** As declared on the form. ⚠️ Not evidence — see OccupationListCheck. */
  occupation_listed?: boolean | null;
  years_experience?: number;
  english_overall?: number;
  english_lowest_band?: number;
  has_skills_assessment?: boolean | null;
  onshore?: boolean | null;
  current_visa?: string;
  has_health_or_character_concern?: boolean | null;
  preferred_subclass?: string;
}

/** What the business side of the questionnaire produces. */
export interface SponsorFacts {
  legal_name?: string;
  trading_name?: string;
  abn?: string;
  industry?: string;
  years_trading?: number;
  employee_count?: number;
  sponsorship_status?: string;
  has_adverse_information?: boolean | null;
  meets_training_obligations?: boolean | null;
  state?: string;
  postcode?: string;
}

/** The role being nominated. */
export interface NominationFacts {
  occupation_code?: string;
  occupation_name?: string;
  subclass?: string;
  annual_salary?: number;
  work_state?: string;
  work_postcode?: string;
  is_regional?: boolean | null;
  lmt_completed?: boolean | null;
}

export interface SubclassAssessment {
  subclass: string;
  label: string;
  eligible: boolean;
  /** Everything the agent should follow up — advisory and blocking alike. */
  unknowns: string[];
  /**
   * The subset of `unknowns` that PREVENTS a determination: a required test
   * that could not be decided because the answer was missing.
   *
   * This exists because "no blockers" is not the same as "eligible". A blank
   * form produces no blockers at all — nothing failed, because nothing was
   * checked — and treating that as a pass would tell someone who answered
   * nothing that they qualify. Eligibility requires that every decisive test
   * was actually decided.
   */
  undetermined: string[];
  /** Checks that failed — the reasons this subclass is out. */
  blockers: string[];
  /** Checks that passed, worth showing as positives. */
  passes: string[];
  permanentResidence: SubclassRule['permanentResidence'];
}

export interface EligibilityResult {
  /** Does the strongest available pathway clear the statutory tests? */
  statutory_eligible: boolean;
  /** Is this someone the practice wants to take on? Commercial, not legal. */
  client_fit: boolean;
  /** The best subclass found, if any. */
  recommended_subclass?: string;
  recommended_label?: string;
  /** Plain-English lines for the result screen. */
  reasons: string[];
  /** Things that must be resolved before an application is viable. */
  blockers: string[];
  /** Questions the agent should ask on the call. */
  open_questions: string[];
  /** Per-subclass detail, for the agent view. */
  assessments: SubclassAssessment[];
  /** Sponsor-side findings (business party only). */
  sponsor_findings: string[];
  /** Stamped so a past decision can be explained after the rules change. */
  assessed_at: string;
  /**
   * Bumped whenever the config or engine logic changes materially. Lets you
   * find every prospect screened under a superseded rule set.
   */
  engine_version: string;
}

/**
 * The engine version. BUMP THIS whenever employer-sponsored.config.ts changes
 * in a way that could change an outcome — it is the only way to know which
 * prospects were screened under which rules.
 */
export const ENGINE_VERSION = '0.1.0-placeholder-rules';

/**
 * Runs the employer-sponsored pre-screen.
 *
 * Design rules this file sticks to:
 *  1. Unknown is never treated as pass. A missing answer becomes an
 *     open question, not a green light.
 *  2. Unknown is never treated as fail either — an incomplete form should
 *     not disqualify someone the agent could still help.
 *  3. Every negative gets a reason a human can read out on a phone call.
 *
 * ⚠️ The thresholds it applies are placeholders. See the config file.
 */
@Injectable()
export class EmployerSponsoredEngine {
  private readonly logger = new Logger(EmployerSponsoredEngine.name);

  /**
   * Swap-in point for the real occupation list lookup. Assign this from the
   * occupations module at wire-up time and the engine stops trusting the
   * form answer. Left null so the placeholder behaviour is explicit rather
   * than hidden.
   */
  private occupationListCheck: OccupationListCheck | null = null;

  setOccupationListCheck(check: OccupationListCheck): void {
    this.occupationListCheck = check;
  }

  async assess(input: {
    party: 'applicant' | 'business';
    applicant?: ApplicantFacts;
    sponsor?: SponsorFacts;
    nomination?: NominationFacts;
  }): Promise<EligibilityResult> {
    const applicant = input.applicant ?? {};
    const nomination = input.nomination ?? {};

    const sponsorFindings = input.sponsor
      ? this.assessSponsor(input.sponsor)
      : [];

    // Only assess the subclass the prospect asked about, if they named one;
    // otherwise try each in preference order.
    const candidates = nomination.subclass
      ? [nomination.subclass]
      : applicant.preferred_subclass
        ? [applicant.preferred_subclass, ...CONSIDERED_SUBCLASSES]
        : CONSIDERED_SUBCLASSES;

    const seen = new Set<string>();
    const assessments: SubclassAssessment[] = [];
    for (const subclass of candidates) {
      if (seen.has(subclass)) continue;
      seen.add(subclass);
      const rule = SUBCLASS_RULES[subclass];
      if (!rule) {
        this.logger.warn(`Unknown subclass requested: ${subclass}`);
        continue;
      }
      assessments.push(
        await this.assessSubclass(subclass, rule, applicant, nomination),
      );
    }

    // Prefer an eligible subclass; among those, prefer direct PR.
    const eligible = assessments.filter((a) => a.eligible);
    const best =
      eligible.find((a) => a.permanentResidence === 'direct') ??
      eligible[0] ??
      // Nothing eligible — surface whichever came closest, so the result
      // screen can say what is missing rather than just "no".
      [...assessments].sort(
        (a, b) =>
          a.blockers.length - b.blockers.length ||
          a.undetermined.length - b.undetermined.length,
      )[0];

    const statutoryEligible = eligible.length > 0;

    // A sponsor-side hard problem stops the whole file regardless of how
    // strong the applicant is.
    const sponsorBlocking =
      input.sponsor?.has_adverse_information === true ||
      input.sponsor?.meets_training_obligations === false;

    const fit = computeClientFit({
      party: input.party,
      age: applicant.age,
      annualSalary: nomination.annual_salary,
      subclass: best?.subclass,
      hasAbn: !!input.sponsor?.abn,
      statutoryEligible: statutoryEligible && !sponsorBlocking,
    });

    const reasons: string[] = [];
    const blockers: string[] = [];
    const openQuestions: string[] = [];

    if (statutoryEligible && !sponsorBlocking) {
      reasons.push(
        `On the information provided, ${best.label} looks like the strongest ` +
          `available pathway.`,
      );
      reasons.push(...best.passes);
    } else if (best && best.blockers.length === 0 && best.undetermined.length) {
      // Nothing has failed — there simply isn't enough to decide on. Saying
      // "you are not eligible" here would be wrong and would lose the lead.
      reasons.push(
        `There isn't enough information yet to assess ${best.label}. ` +
          `Answering the outstanding questions will give you a result.`,
      );
    } else if (best) {
      reasons.push(
        `On the information provided, ${best.label} is the closest pathway, ` +
          `but it is not currently met.`,
      );
      blockers.push(...best.blockers);
    } else {
      blockers.push(
        'No employer-sponsored pathway could be assessed from the information provided.',
      );
    }

    if (sponsorBlocking) {
      blockers.push(
        'A sponsor-side issue was declared that must be resolved before any ' +
          'nomination can proceed.',
      );
    }

    if (best) openQuestions.push(...best.unknowns);
    if (applicant.has_health_or_character_concern === true) {
      openQuestions.push(
        'A health or character matter was declared — this needs to be worked ' +
          'through before lodgement.',
      );
    }
    if (applicant.has_health_or_character_concern == null) {
      openQuestions.push('Health and character position not yet declared.');
    }

    reasons.push(...fit.reasons);

    return {
      statutory_eligible: statutoryEligible && !sponsorBlocking,
      client_fit: fit.fit,
      recommended_subclass: best?.eligible ? best.subclass : undefined,
      recommended_label: best?.eligible ? best.label : undefined,
      reasons: dedupe(reasons),
      blockers: dedupe([...blockers, ...sponsorFindings.filter(isNegative)]),
      open_questions: dedupe(openQuestions),
      assessments,
      sponsor_findings: sponsorFindings,
      assessed_at: new Date().toISOString(),
      engine_version: ENGINE_VERSION,
    };
  }

  // -------------------------------------------------------------------------

  private async assessSubclass(
    subclass: string,
    rule: SubclassRule,
    applicant: ApplicantFacts,
    nomination: NominationFacts,
  ): Promise<SubclassAssessment> {
    const blockers: string[] = [];
    const unknowns: string[] = [];
    const passes: string[] = [];

    // A gap in a decisive test: recorded in both lists. `unknowns` drives what
    // the agent asks on the call; `undetermined` stops the subclass being
    // called eligible.
    const undetermined: string[] = [];
    const cannotDetermine = (reason: string) => {
      unknowns.push(reason);
      undetermined.push(reason);
    };

    // --- Age ---
    if (rule.maxAge !== null) {
      if (applicant.age == null) {
        cannotDetermine('Age was not provided.');
      } else if (applicant.age > rule.maxAge) {
        blockers.push(
          `${rule.label} has an age limit of ${rule.maxAge}; the applicant is ${applicant.age}.`,
        );
      } else {
        passes.push(`Within the age limit for ${rule.label}.`);
      }
    }

    // --- Experience ---
    if (applicant.years_experience == null) {
      cannotDetermine('Years of relevant work experience were not provided.');
    } else if (applicant.years_experience < rule.minYearsExperience) {
      blockers.push(
        `${rule.label} requires at least ${rule.minYearsExperience} year(s) of ` +
          `relevant experience; ${applicant.years_experience} was given.`,
      );
    } else {
      passes.push('Meets the minimum work experience requirement.');
    }

    // --- English ---
    if (
      applicant.english_overall == null &&
      applicant.english_lowest_band == null
    ) {
      cannotDetermine('English test results were not provided.');
    } else {
      if (
        applicant.english_overall != null &&
        applicant.english_overall < rule.minEnglishOverall
      ) {
        blockers.push(
          `${rule.label} requires an overall English score of at least ` +
            `${rule.minEnglishOverall} (IELTS-equivalent).`,
        );
      }
      if (
        applicant.english_lowest_band != null &&
        applicant.english_lowest_band < rule.minEnglishPerBand
      ) {
        blockers.push(
          `${rule.label} requires at least ${rule.minEnglishPerBand} in every ` +
            `component (IELTS-equivalent).`,
        );
      }
      if (
        (applicant.english_overall ?? Infinity) >= rule.minEnglishOverall &&
        (applicant.english_lowest_band ?? Infinity) >= rule.minEnglishPerBand
      ) {
        passes.push('Meets the English requirement.');
      }
    }

    // --- Occupation on the relevant list ---
    const listed = await this.checkOccupationListed(
      applicant.occupation_code ?? nomination.occupation_code,
      rule.occupationLists,
      applicant.occupation_listed,
    );
    if (listed == null) {
      cannotDetermine(
        'Whether the nominated occupation appears on the relevant skilled ' +
          'occupation list has not been confirmed.',
      );
    } else if (listed === false) {
      blockers.push(
        `The nominated occupation does not appear on the list(s) required for ` +
          `${rule.label}.`,
      );
    } else {
      passes.push('The nominated occupation appears on the required list.');
    }

    // --- Salary ---
    if (nomination.annual_salary == null) {
      cannotDetermine('The nominated annual salary was not provided.');
    } else if (nomination.annual_salary < rule.minSalary) {
      blockers.push(
        `The nominated salary of $${fmt(nomination.annual_salary)} is below the ` +
          `$${fmt(rule.minSalary)} income threshold for ${rule.label}.`,
      );
    } else {
      passes.push('The nominated salary clears the income threshold.');
      if (nomination.annual_salary < rule.minSalary / MARKET_RATE_WARNING_MARGIN) {
        unknowns.push(
          'The salary clears the statutory floor but sits close to it — the ' +
            'market salary rate test will need evidence.',
        );
      }
    }

    // --- Regional ---
    if (rule.requiresRegional) {
      if (nomination.is_regional == null) {
        cannotDetermine('Whether the work location is regional was not confirmed.');
      } else if (!nomination.is_regional) {
        blockers.push(
          `${rule.label} requires the position to be in a designated regional area.`,
        );
      } else {
        passes.push('The position is in a designated regional area.');
      }
    }

    // --- Labour Market Testing ---
    if (rule.requiresLmt) {
      if (nomination.lmt_completed == null) {
        unknowns.push('Labour Market Testing status was not confirmed.');
      } else if (!nomination.lmt_completed) {
        // Not a blocker — LMT is something the sponsor can still go and do.
        unknowns.push(
          'Labour Market Testing has not been completed yet; it must be done ' +
            'before the nomination is lodged.',
        );
      } else {
        passes.push('Labour Market Testing has been completed.');
      }
    }

    // --- Skills assessment ---
    if (applicant.has_skills_assessment === false) {
      unknowns.push(
        'No skills assessment yet — whether one is required depends on the ' +
          'occupation and the applicant’s passport.',
      );
    }

    return {
      subclass,
      label: rule.label,
      // Nothing failed AND nothing was left undecided. Both halves matter.
      eligible: blockers.length === 0 && undetermined.length === 0,
      unknowns: dedupe(unknowns),
      undetermined: dedupe(undetermined),
      blockers: dedupe(blockers),
      passes: dedupe(passes),
      permanentResidence: rule.permanentResidence,
    };
  }

  /**
   * Returns true / false / null (unknown).
   *
   * ⚠️ Until setOccupationListCheck() is wired to the occupations module this
   * falls back to what the prospect ticked on the form, which is not evidence.
   */
  private async checkOccupationListed(
    occupationCode: string | undefined,
    requiredLists: string[],
    declared: boolean | null | undefined,
  ): Promise<boolean | null> {
    if (this.occupationListCheck) {
      try {
        return await this.occupationListCheck(occupationCode, requiredLists);
      } catch (error) {
        this.logger.error(
          `Occupation list lookup failed: ${(error as Error).message}`,
        );
        return null;
      }
    }
    return declared ?? null;
  }

  private assessSponsor(sponsor: SponsorFacts): string[] {
    const findings: string[] = [];

    if (!sponsor.abn) {
      findings.push('No ABN was provided for the sponsoring business.');
    }

    if (sponsor.years_trading == null) {
      findings.push('How long the business has been trading was not provided.');
    } else if (sponsor.years_trading < SPONSOR_RULES.minYearsTradingForStandard) {
      findings.push(
        `The business has been trading for under ` +
          `${SPONSOR_RULES.minYearsTradingForStandard} year(s), which limits the ` +
          `sponsorship options available to it.`,
      );
    }

    if (
      sponsor.employee_count != null &&
      sponsor.employee_count < SPONSOR_RULES.smallBusinessHeadcount
    ) {
      findings.push(
        'Small headcount — expect closer scrutiny of whether the nominated ' +
          'position is genuine and full-time.',
      );
    }

    if (sponsor.has_adverse_information === true) {
      findings.push(
        'Adverse information was declared against the business or an ' +
          'associate. This must be addressed before any nomination.',
      );
    }

    if (sponsor.meets_training_obligations === false) {
      findings.push(
        'The business declared it does not currently meet its training / ' +
          'Skilling Australians Fund obligations.',
      );
    }

    if (sponsor.sponsorship_status === 'refused') {
      findings.push(
        'A previous sponsorship application was refused — the history needs ' +
          'to be reviewed before reapplying.',
      );
    }
    if (sponsor.sponsorship_status === 'approved') {
      findings.push('The business already holds an approved sponsorship.');
    }

    return findings;
  }
}

// ---------------------------------------------------------------------------

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function fmt(value: number): string {
  return value.toLocaleString('en-AU', { maximumFractionDigits: 0 });
}

/**
 * Sponsor findings are a mixed bag of good and bad news; only the bad ones
 * belong in the blockers list on the result screen.
 */
function isNegative(finding: string): boolean {
  return (
    finding.includes('Adverse information') ||
    finding.includes('does not currently meet') ||
    finding.includes('was refused')
  );
}
