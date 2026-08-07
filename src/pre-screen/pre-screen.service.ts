import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { SubmitPreScreenDto } from './dto/submit-pre-screen.dto';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { OccupationsService } from '../occupations/occupations.service';
import { SponsorRepository } from '../employer-sponsored/sponsor.repository';
import { NominationRepository } from '../employer-sponsored/nomination.repository';
import {
  ApplicantFacts,
  EligibilityResult,
  EmployerSponsoredEngine,
  NominationFacts,
  SponsorFacts,
} from '../employer-sponsored/employer-sponsored.engine';
import { Sponsor } from '../employer-sponsored/entities/sponsor.entity';

/**
 * What the prospect sees on the result screen. Deliberately narrower than the
 * engine's own output: `assessments` and `sponsor_findings` are internal
 * working, and showing a prospect every rule the engine considered invites
 * them to reverse-engineer the answers that produce a "yes".
 */
export interface PreScreenResult {
  prospect_id: string;
  human_ref: string;
  statutory_eligible: boolean;
  client_fit: boolean;
  /** True only when both flags pass — the frontend gates the Book button on this. */
  can_book: boolean;
  recommended_subclass?: string;
  recommended_label?: string;
  reasons: string[];
  blockers: string[];
  next_steps: string[];
}

/**
 * Runs the native questionnaire end to end:
 *
 *   validate -> build facts -> run engine -> write prospect (+ sponsor +
 *   nomination) -> set the two flags -> stash the prep summary -> return a
 *   live result.
 *
 * The write happens whether or not the person is eligible. An ineligible
 * prospect is still a record the agency wants — they may become eligible, and
 * they are evidence about which pathway the funnel attracts.
 */
@Injectable()
export class PreScreenService implements OnModuleInit {
  private readonly logger = new Logger(PreScreenService.name);

  constructor(
    private readonly engine: EmployerSponsoredEngine,
    private readonly prospectService: ProspectService,
    private readonly summaryService: ProspectSummaryService,
    private readonly occupationsService: OccupationsService,
    private readonly sponsorRepository: SponsorRepository,
    private readonly nominationRepository: NominationRepository,
  ) {}

  /**
   * Point the engine at the real occupations catalogue.
   *
   * Without this the engine falls back to whatever the prospect ticked on the
   * form, which is not evidence — and since the questionnaire deliberately
   * stopped asking, that fallback resolves to "unknown" for every submission
   * and no business could ever come back eligible.
   */
  onModuleInit(): void {
    this.engine.setOccupationListCheck((code, lists) =>
      this.occupationsService.isOnAnyList(code, lists),
    );
  }

  async submit(dto: SubmitPreScreenDto): Promise<PreScreenResult> {
    if (!dto.contact?.consent_given) {
      throw new BadRequestException(
        'Consent is required before we can record your details.',
      );
    }

    const { applicantFacts, sponsorFacts, nominationFacts } =
      this.buildFacts(dto);

    // Run the engine BEFORE writing anything. If the rules throw we would
    // rather fail the request than store a prospect with null flags that
    // silently never gets screened.
    const result = await this.engine.assess({
      party: dto.party,
      applicant: applicantFacts,
      sponsor: sponsorFacts,
      nomination: nominationFacts,
    });

    const prospect = await this.prospectService.create({
      party: dto.party,
      full_name: dto.contact.full_name,
      email: dto.contact.email,
      phone: dto.contact.phone,
      company_name: sponsorFacts?.legal_name,
      source: dto.source ?? 'pre_screen',
      visa_interest: result.recommended_subclass
        ? `subclass_${result.recommended_subclass}`
        : nominationFacts?.subclass
          ? `subclass_${nominationFacts.subclass}`
          : undefined,
      consent_given: true,
      consent_text: dto.contact.consent_text,
      consent_at: new Date(),
      statutory_eligible: result.statutory_eligible,
      client_fit: result.client_fit,
      stage: 'pre_screened',
    });

    // Sponsor / nomination are best-effort. If they fail we still have the
    // prospect and the engine result, and the agent can rebuild the detail
    // from raw_answers on the call.
    let sponsor: Sponsor | null = null;
    try {
      sponsor = await this.persistSponsorship(
        prospect.id,
        sponsorFacts,
        nominationFacts,
      );
      if (sponsor) {
        await this.prospectService.linkSponsor(prospect.id, sponsor.id);
      }
    } catch (error) {
      this.logger.error(
        `Failed to persist sponsorship for prospect ${prospect.human_ref}: ${(error as Error).message}`,
      );
    }

    await this.summaryService.refresh(prospect.id, {
      answers: dto.raw_answers ?? this.fallbackAnswers(dto),
      engine_result: result as unknown as Record<string, any>,
    });

    return this.toClientResult(prospect.id, prospect.human_ref, result);
  }

  // -------------------------------------------------------------------------

  /**
   * Flattens the two payload shapes into the three fact objects the engine
   * takes. A business submission may carry a candidate; an applicant
   * submission may name a sponsoring employer. Both produce the same triple.
   */
  private buildFacts(dto: SubmitPreScreenDto): {
    applicantFacts?: ApplicantFacts;
    sponsorFacts?: SponsorFacts;
    nominationFacts?: NominationFacts;
  } {
    if (dto.party === 'business') {
      if (!dto.business) {
        throw new BadRequestException(
          'A business submission must include the business details.',
        );
      }
      return {
        applicantFacts: dto.business.candidate as ApplicantFacts | undefined,
        sponsorFacts: dto.business.sponsor as SponsorFacts | undefined,
        nominationFacts: dto.business.nomination as NominationFacts | undefined,
      };
    }

    if (!dto.applicant) {
      throw new BadRequestException(
        'An applicant submission must include the applicant details.',
      );
    }
    return {
      applicantFacts: dto.applicant as ApplicantFacts,
      sponsorFacts: dto.sponsoring_employer as SponsorFacts | undefined,
      nominationFacts: dto.offered_role as NominationFacts | undefined,
    };
  }

  private async persistSponsorship(
    prospectId: string,
    sponsorFacts?: SponsorFacts,
    nominationFacts?: NominationFacts,
  ): Promise<Sponsor | null> {
    // A nomination with no employer behind it is not a nomination — skip both
    // rather than create an orphan role nobody can act on.
    if (!sponsorFacts?.legal_name && !sponsorFacts?.abn) {
      return null;
    }

    const sponsor = await this.sponsorRepository.create({
      prospect_id: prospectId,
      legal_name: sponsorFacts.legal_name ?? 'Unnamed business',
      trading_name: sponsorFacts.trading_name,
      abn: sponsorFacts.abn?.replace(/\s/g, ''),
      industry: sponsorFacts.industry,
      employee_count: sponsorFacts.employee_count,
      years_trading: sponsorFacts.years_trading,
      state: sponsorFacts.state,
      postcode: sponsorFacts.postcode,
      business_address: sponsorFacts.business_address,
      sponsored_last_5_years: sponsorFacts.sponsored_last_5_years ?? null,
      is_standard_business_sponsor:
        sponsorFacts.is_standard_business_sponsor ?? null,
      annual_revenue_band: sponsorFacts.annual_revenue_band,
      years_operating_band: sponsorFacts.years_operating_band,
      operates_only_in_australia:
        sponsorFacts.operates_only_in_australia ?? null,
      employee_count_band: sponsorFacts.employee_count_band,
      has_temporary_visa_employees:
        sponsorFacts.has_temporary_visa_employees ?? null,
      referral_source: sponsorFacts.referral_source,
      sponsorship_status: (sponsorFacts.sponsorship_status ??
        'unknown') as Sponsor['sponsorship_status'],
      has_adverse_information: sponsorFacts.has_adverse_information ?? null,
      meets_training_obligations:
        sponsorFacts.meets_training_obligations ?? null,
      raw_answers: sponsorFacts as Record<string, any>,
    });

    if (nominationFacts && Object.keys(nominationFacts).length > 0) {
      await this.nominationRepository.create({
        sponsor_id: sponsor.id,
        occupation_code: nominationFacts.occupation_code,
        occupation_name: nominationFacts.occupation_name,
        position_title: nominationFacts.position_title,
        subclass: nominationFacts.subclass,
        annual_salary: nominationFacts.annual_salary,
        salary_band: nominationFacts.salary_band,
        candidate_current_pay_band: nominationFacts.candidate_current_pay_band,
        work_state: nominationFacts.work_state,
        work_postcode: nominationFacts.work_postcode,
        is_regional: nominationFacts.is_regional ?? null,
        lmt_completed: nominationFacts.lmt_completed ?? null,
        // 'open' = advertised to the matching queue. It stays draft until the
        // agent has looked at it, so a half-finished questionnaire does not
        // start appearing as a live role.
        status: 'draft',
        raw_answers: nominationFacts as Record<string, any>,
      });
    }

    return sponsor;
  }

  /**
   * If the frontend did not send raw_answers, keep the structured payload so
   * the agent still has something on the call.
   */
  private fallbackAnswers(dto: SubmitPreScreenDto): Record<string, any> {
    return {
      party: dto.party,
      applicant: dto.applicant,
      business: dto.business,
      sponsoring_employer: dto.sponsoring_employer,
      offered_role: dto.offered_role,
    };
  }

  private toClientResult(
    prospectId: string,
    humanRef: string,
    result: EligibilityResult,
  ): PreScreenResult {
    const canBook = result.statutory_eligible && result.client_fit;

    const nextSteps: string[] = [];
    if (canBook) {
      nextSteps.push(
        'Book a consultation with a registered migration agent to confirm ' +
          'this assessment and plan the application.',
      );
    } else if (result.statutory_eligible && !result.client_fit) {
      // Eligible but not a fit: do not offer a paid consult we do not want to
      // sell. Route to a human instead.
      nextSteps.push(
        'Your situation looks workable, but it sits outside what we currently ' +
          'take on. Get in touch and we will point you to the right help.',
      );
    } else if (!result.blockers.length && result.open_questions.length) {
      // Nothing failed — the form was just too incomplete to decide on.
      // Telling this person "you are not eligible" would be false, and it
      // would lose a lead who has not actually been assessed yet.
      nextSteps.push(
        'We could not complete your assessment because some answers are ' +
          'missing. Fill in the outstanding questions to get a result.',
      );
    } else {
      nextSteps.push(
        'Based on what you told us, an employer-sponsored pathway is not open ' +
          'to you right now.',
      );
      if (result.open_questions.length) {
        nextSteps.push(
          'Some answers were incomplete — filling those in may change this result.',
        );
      }
    }

    return {
      prospect_id: prospectId,
      human_ref: humanRef,
      statutory_eligible: result.statutory_eligible,
      client_fit: result.client_fit,
      can_book: canBook,
      recommended_subclass: result.recommended_subclass,
      recommended_label: result.recommended_label,
      reasons: result.reasons,
      blockers: result.blockers,
      next_steps: nextSteps,
    };
  }
}
