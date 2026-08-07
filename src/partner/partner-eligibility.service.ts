import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerEligibilitySubmission } from './entities/partner-eligibility-submission.entity';
import {
  PartnerEligibilityEngine,
  EligibilityResult,
} from './partner-eligibility.engine';
import { PartnerEligibilityDto } from './dto/partner-eligibility.dto';
import { LeadsService } from '../leads/leads.service';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';

export interface PartnerEligibilityResponse extends EligibilityResult {
  id: string;
  applicantFirstName: string;
  sponsorFirstName: string;
  /**
   * The funnel spine. Everything downstream — the Calendly link, the pending
   * booking the webhook creates, Stripe checkout, the admin prospect list —
   * is keyed on this. Null only if the prospect write failed, in which case the
   * quiz still returns its result and the frontend hides the booking CTA.
   */
  prospect_id: string | null;
  human_ref: string | null;
  /**
   * Whether to offer the paid consultation. False for `ineligible`: we do not
   * sell a consult to someone we have just told we cannot help. Mirrors
   * `can_book` on the employer-sponsored pre-screen result.
   */
  can_book: boolean;
}

@Injectable()
export class PartnerEligibilityService {
  private readonly logger = new Logger(PartnerEligibilityService.name);

  constructor(
    @InjectRepository(PartnerEligibilitySubmission)
    private readonly submissions: Repository<PartnerEligibilitySubmission>,
    private readonly engine: PartnerEligibilityEngine,
    private readonly leadsService: LeadsService,
    private readonly prospectService: ProspectService,
    private readonly summaryService: ProspectSummaryService,
  ) {}

  async submit(
    dto: PartnerEligibilityDto,
  ): Promise<PartnerEligibilityResponse> {
    if (!dto.consent_given) {
      throw new BadRequestException(
        'Consent is required before we can record your details.',
      );
    }

    const result = this.engine.assess(dto);

    const saved = await this.submissions.save(
      this.submissions.create({
        applicantFirstName: dto.applicantFirstName,
        sponsorFirstName: dto.sponsorFirstName,
        completedBy: dto.completedBy,
        email: dto.email,
        applicantCountry: dto.applicantCountry,
        relationshipStatus: dto.relationshipStatus,
        outcome: result.outcome,
        summary: result.summary,
        effort: result.effort,
        highRisk: result.highRisk,
        becomingEligible: result.becomingEligible,
        answers: dto as unknown as Record<string, unknown>,
      }),
    );

    this.logger.log(
      `Partner eligibility submission ${saved.id}: ${result.summary} / ${result.effort}`,
    );

    // The prospect is the record everything else hangs off: the Calendly link
    // carries its id, the invitee webhook creates the pending booking against
    // it, Stripe confirms that booking, and the admin panel lists it. Written
    // for every outcome — an ineligible couple is still a lead worth holding,
    // and they may become eligible.
    const prospect = await this.createProspect(dto, result, saved.id);

    // Also register the submission as a lead so it shows up in the admin
    // Leads panel and triggers the usual new-lead notifications. Lead
    // capture must never fail the quiz response itself.
    this.leadsService
      .create({
        full_name: `${dto.applicantFirstName} & ${dto.sponsorFirstName}`,
        email: dto.email,
        visa_type: 'Partner visa (820/801/309/100/300)',
        message:
          `Partner eligibility quiz — ${result.summary} (${result.effort}). ` +
          `Completed by: ${dto.completedBy}. ` +
          `Applicant country: ${dto.applicantCountry}. ` +
          `Relationship: ${dto.relationshipStatus}. ` +
          `Submission: ${saved.id}`,
        source: 'partner_eligibility',
      })
      .catch((error) => {
        this.logger.error(
          `Failed to create lead for eligibility submission ${saved.id}: ${error.message}`,
        );
      });

    return {
      id: saved.id,
      applicantFirstName: saved.applicantFirstName,
      sponsorFirstName: saved.sponsorFirstName,
      prospect_id: prospect?.id ?? null,
      human_ref: prospect?.human_ref ?? null,
      // Both conditions matter. Without a prospect there is nothing for the
      // booking to attach to, so the CTA would produce an unlinked Calendly
      // invitee the agent cannot reconcile.
      can_book: Boolean(prospect) && result.outcome !== 'ineligible',
      ...result,
    };
  }

  /**
   * Writes the prospect + agent prep summary.
   *
   * Never throws: a failed prospect write must not lose the quiz result the
   * person is waiting on. The caller degrades to `can_book: false`, which shows
   * a contact-us message instead of a booking button — a visible dead end an
   * agent can rescue, rather than a booking that silently cannot be paid for.
   */
  private async createProspect(
    dto: PartnerEligibilityDto,
    result: EligibilityResult,
    submissionId: string,
  ) {
    try {
      const prospect = await this.prospectService.create({
        party: 'applicant',
        full_name: `${dto.applicantFirstName} & ${dto.sponsorFirstName}`,
        email: dto.email,
        source: 'partner_eligibility',
        visa_interest: 'partner_820_801_309_100_300',
        consent_given: true,
        consent_text: dto.consent_text,
        consent_at: new Date(),
        // The engine answers the statutory question. Client fit is a
        // commercial call and this quiz does not ask what it would need to
        // (budget, complexity, whether we service the case) — so it is left
        // null rather than guessed. An agent sets it.
        statutory_eligible: result.outcome !== 'ineligible',
        client_fit: null,
        stage: 'pre_screened',
      });

      await this.summaryService.refresh(prospect.id, {
        answers: dto as unknown as Record<string, any>,
        eligibility: {
          statutory_eligible: result.outcome !== 'ineligible',
          client_fit: null,
          recommended_subclass: '820/801/309/100/300',
          outcome: result.outcome,
          summary: result.summary,
          effort: result.effort,
          high_risk: result.highRisk,
          becoming_eligible: result.becomingEligible,
          submission_id: submissionId,
        },
      });

      return prospect;
    } catch (error) {
      this.logger.error(
        `Failed to create prospect for eligibility submission ${submissionId}: ` +
          `${(error as Error).message} — the quiz result was still returned, but ` +
          `this person cannot book until an agent creates the record by hand.`,
      );
      return null;
    }
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.submissions.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
