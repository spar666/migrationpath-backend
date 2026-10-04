import { PolicyConfigService } from '../policy-config/policy-config.service';
import { CommercialConfigService } from '../commercial-config/commercial-config.module';
import { Injectable, Logger } from '@nestjs/common';
import {
  CONSIDERED_SUBCLASSES,
  OccupationListCheck,
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
  sponsored_work_years?: number;
  requests_exemption?: boolean;
  labour_agreement?: boolean;
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
  business_address?: string;
  sponsored_last_5_years?: boolean | null;
  is_standard_business_sponsor?: boolean | null;
  annual_revenue_band?: string;
  years_operating_band?: string;
  operates_only_in_australia?: boolean | null;
  employee_count_band?: string;
  has_temporary_visa_employees?: boolean | null;
  referral_source?: string;
}

/** The role being nominated. */
export interface NominationFacts {
  occupation_code?: string;
  occupation_name?: string;
  position_title?: string;
  subclass?: string;
  annual_salary?: number;
  salary_band?: string;
  candidate_current_pay_band?: string;
  work_state?: string;
  work_postcode?: string;
  is_regional?: boolean | null;
  lmt_completed?: boolean | null;
}

export interface SubclassAssessment {
  subclass: string;
  gap_codes: string[];
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
  best_fit_pathway?: string;
  outcome_tag: string;
  gap_codes: string[];
  /** Professional/legal questions the rules engine must not adjudicate. */
  rma_review_flags: string[];
  /** Declared operational risks, distinct from eligibility and client fit. */
  risk_flags: string[];
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
export const ENGINE_VERSION = '1.0.0-stream-policy';

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
  constructor(private readonly policy: PolicyConfigService, private readonly commercial: CommercialConfigService) {}

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

    const [policy, commercial] = await Promise.all([this.policy.employerSnapshot(), this.commercial.snapshot()]);
    const assessments: SubclassAssessment[] = [];
    // Preferences never remove evaluation branches.
    for (const pathway of CONSIDERED_SUBCLASSES) {
      const core = pathway.startsWith('482');
      const trt = pathway === '186-trt';
      const keys = {
        maxAge: core ? null : 'employer.maxAge',
        minYearsExperience: trt ? 'employer.trtMinSponsoredYears' : core ? 'employer.coreMinExperienceYears' : pathway === '494-es' ? 'employer.regionalMinExperienceYears' : 'employer.deMinExperienceYears',
        minSalary: pathway === '482-specialist' ? 'employer.specialistIncome' : 'employer.coreSkillsIncome',
        minEnglishOverall: `employer.${pathway}.englishOverall`,
        minEnglishPerBand: `employer.${pathway}.englishPerBand`,
      };
      const missing = Object.values(keys).filter((key): key is string => key !== null && !policy.has(key));
      if (missing.length) {
        assessments.push({ subclass: pathway, label: pathway, eligible: false,
          gap_codes: ['policy_unverified'], blockers: [], passes: [],
          unknowns: [`RMA verification required: ${missing.join(', ')}`],
          undetermined: ['RMA verification of policy settings is required.'],
          permanentResidence: pathway.startsWith('186') ? 'direct' : 'pathway' });
        continue;
      }
      const rule: SubclassRule = {
        label: pathway,
        maxAge: keys.maxAge ? policy.get(keys.maxAge) ?? null : null,
        minYearsExperience: policy.get(keys.minYearsExperience) ?? Infinity,
        minSalary: policy.get(keys.minSalary) ?? Infinity,
        minEnglishOverall: policy.get(keys.minEnglishOverall) ?? Infinity,
        minEnglishPerBand: policy.get(keys.minEnglishPerBand) ?? Infinity,
        requiresRegional: pathway === '494-es', requiresLmt: core || pathway === '494-es',
        occupationLists: pathway === '482-core' || pathway === '186-de' ? ['CSOL'] : pathway === '494-es' ? ['MLTSSL', 'ROL'] : [],
        permanentResidence: pathway.startsWith('186') ? 'direct' : 'pathway',
      };
      const assessment = await this.assessSubclass(pathway, rule, applicant, nomination);
      assessments.push(assessment);
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
          Number(a.gap_codes.includes('policy_unverified')) - Number(b.gap_codes.includes('policy_unverified')) ||
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
    }, commercial);

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

    const gapCodes = dedupe(best?.gap_codes ?? []);
    if (sponsorBlocking || applicant.requests_exemption || applicant.labour_agreement) gapCodes.push('professional_review');
    const rmaReviewFlags = dedupe([
      ...(gapCodes.includes('policy_unverified') ? ['policy_verification'] : []),
      ...(applicant.requests_exemption ? ['possible_exemption'] : []),
      ...(applicant.labour_agreement ? ['labour_agreement'] : []),
      ...(applicant.has_skills_assessment != null ? ['skills_assessment_validity'] : []),
      ...(nomination.annual_salary != null ? ['amsr', 'genuine_position'] : []),
      ...(nomination.lmt_completed != null ? ['lmt_adequacy'] : []),
      ...(applicant.has_health_or_character_concern != null
        ? ['health_character']
        : []),
    ]);
    const riskFlags = dedupe([
      ...(applicant.has_health_or_character_concern === true
        ? ['health_character_concern']
        : []),
      ...(input.sponsor?.has_adverse_information === true
        ? ['sponsor_adverse_information']
        : []),
      ...(input.sponsor?.meets_training_obligations === false
        ? ['sponsor_training_obligations']
        : []),
      ...(input.sponsor?.sponsorship_status === 'refused'
        ? ['previous_sponsorship_refusal']
        : []),
    ]);
    const outcomeTag = gapCodes.includes('policy_unverified') ? 'review_required'
      : gapCodes.includes('professional_review') ? 'review_required'
      : statutoryEligible && !sponsorBlocking ? 'may_be_eligible'
      : best?.undetermined.length ? 'incomplete'
      : gapCodes.length === 1 && gapCodes[0] === 'income_short' ? 'income_below_threshold' : 'requirements_not_met';
    return {
      best_fit_pathway: best?.subclass,
      outcome_tag: outcomeTag,
      gap_codes: dedupe(gapCodes),
      rma_review_flags: rmaReviewFlags,
      risk_flags: riskFlags,
      statutory_eligible: statutoryEligible && !sponsorBlocking,
      client_fit: fit.fit,
      recommended_subclass: best?.eligible ? best.subclass : undefined,
      recommended_label: best?.eligible ? best.label : undefined,
      reasons: dedupe([...reasons, 'You may be eligible based on this indicative pre-screen. A registered migration agent must confirm the requirements.'].filter((r, i) => i < reasons.length || statutoryEligible && !sponsorBlocking)),
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
    const gap_codes: string[] = [];
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
      } else if (applicant.age >= rule.maxAge) {
        gap_codes.push('age_limit');
        blockers.push(
          `${rule.label} has an age limit of ${rule.maxAge}; the applicant is ${applicant.age}.`,
        );
      } else {
        passes.push(`Within the age limit for ${rule.label}.`);
      }
    }

    if (applicant.requests_exemption || applicant.labour_agreement) {
      cannotDetermine('An exemption or Labour Agreement requires professional review.');
      gap_codes.push('professional_review');
    }
    if (subclass === '186-trt') {
      if (!applicant.current_visa) cannotDetermine('Current 457/482 visa status was not provided.');
      else if (!['457', '482'].includes(applicant.current_visa)) {
        blockers.push('TRT requires review of the current qualifying visa.'); gap_codes.push('qualifying_visa_missing');
      }
    }
    const experience = subclass === '186-trt' ? applicant.sponsored_work_years : applicant.years_experience;
    // --- Experience ---
    if (experience == null) {
      cannotDetermine('Years of relevant work experience were not provided.');
    } else if (experience < rule.minYearsExperience) {
      gap_codes.push(subclass === '186-trt' ? 'sponsored_work_short' : 'experience_short');
      blockers.push(
        `${rule.label} requires at least ${rule.minYearsExperience} year(s) of ` +
          `relevant experience; ${experience} was given.`,
      );
    } else {
      passes.push('Meets the minimum work experience requirement.');
    }

    // --- English ---
    if (
      applicant.english_overall == null ||
      applicant.english_lowest_band == null
    ) {
      cannotDetermine('English test results were not provided.');
    } else {
      if (
        applicant.english_overall != null &&
        applicant.english_overall < rule.minEnglishOverall
      ) {
        gap_codes.push('english_short');
        blockers.push(
          `${rule.label} requires an overall English score of at least ` +
            `${rule.minEnglishOverall} (IELTS-equivalent).`,
        );
      }
      if (
        applicant.english_lowest_band != null &&
        applicant.english_lowest_band < rule.minEnglishPerBand
      ) {
        gap_codes.push('english_short');
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

    // Specialist uses ANZSCO major groups; TRT has no CSOL gate.
    const code = applicant.occupation_code ?? nomination.occupation_code;
    if (subclass === '482-specialist') {
      if (!code || !/^\d{6}$/.test(code)) cannotDetermine('A valid ANZSCO code is required.');
      else if (!['1', '2', '4', '5', '6'].includes(code[0])) {
        blockers.push('The ANZSCO major group is outside the Specialist stream.'); gap_codes.push('occupation_group_excluded');
      }
    } else if (rule.occupationLists.length) {
      const listed = await this.checkOccupationListed(code, rule.occupationLists, applicant.occupation_listed);
      if (listed == null) cannotDetermine('Occupation membership has not been confirmed from the official dataset.');
      else if (!listed) { blockers.push('The occupation is outside the required lists.'); gap_codes.push('occupation_not_listed'); }
      else passes.push('The occupation appears on a required list.');
    }

    // --- Salary ---
    if (nomination.annual_salary == null) {
      cannotDetermine('The nominated annual salary was not provided.');
    } else if (nomination.annual_salary < rule.minSalary) {
      gap_codes.push('income_short');
      blockers.push(
        `The nominated salary of $${fmt(nomination.annual_salary)} is below the ` +
          `$${fmt(rule.minSalary)} income threshold for ${rule.label}.`,
      );
    } else {
      passes.push('The nominated salary clears the income threshold.');
      unknowns.push('Annual market salary rate and genuine-position evidence require RMA review.');
    }

    // --- Regional ---
    if (rule.requiresRegional) {
      if (nomination.is_regional == null) {
        cannotDetermine(
          'Whether the work location is regional was not confirmed.',
        );
      } else if (!nomination.is_regional) {
        gap_codes.push('regional_location_required');
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

    unknowns.push('Skills-assessment validity, exemptions, occupation caveats, health and character require RMA review.');
    // --- Skills assessment ---
    if (applicant.has_skills_assessment === false) {
      unknowns.push(
        'No skills assessment yet — whether one is required depends on the ' +
          'occupation and the applicant’s passport.',
      );
    }

    return {
      subclass,
      gap_codes: dedupe(gap_codes),
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
    return null;
  }

  private assessSponsor(sponsor: SponsorFacts): string[] {
    const findings: string[] = [];

    if (!sponsor.abn) {
      findings.push('No ABN was provided for the sponsoring business.');
    }

    findings.push('Business viability, genuine position and sponsorship obligations require RMA review.');

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
