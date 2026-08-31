import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PointsAggregatorService } from './points-aggregator.service';
import { CaptureCalculatorLeadDto } from './dto/capture-lead.dto';
import { StructuredPointsResultDto } from './dto/user-profile.dto';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { LeadsService } from '../leads/leads.service';
import { PolicyConfigService } from '../policy-config/policy-config.service';
import { GSM_MAX_AGE } from './constants/points-catalogue';

/**
 * The points-tested subclasses this product features. 189 is scored on the
 * applicant's own points; 190 and 491 add a nomination bonus on top.
 *
 * Deliberately only these three (§1.3, §2.8) — closed and superseded
 * programmes must not appear, and a score against one would be worse than
 * useless because it invites a lead toward something they cannot apply for.
 */
const FEATURED_SUBCLASSES = ['189', '190', '491'] as const;

export type FeaturedSubclass = (typeof FEATURED_SUBCLASSES)[number];

export interface SubclassStanding {
  subclass: FeaturedSubclass;
  /** Points added by a nomination this subclass requires. 0 for 189. */
  nominationPoints: number;
  /** The applicant's own score plus that nomination. */
  effectivePoints: number;
  /** Whether `effectivePoints` reaches the legislated pass mark. */
  meetsPassMark: boolean;
}

export interface CalculatorCaptureResult extends StructuredPointsResultDto {
  prospect_id: string | null;
  human_ref: string | null;
  /**
   * Whether the result screen should offer the booking CTA. False when the
   * prospect write failed — a booking with nothing to attach to produces an
   * unlinked Calendly invitee the agent cannot reconcile.
   */
  can_book: boolean;
  standing: SubclassStanding[];
}

/**
 * Lead capture at the end of the points calculator.
 *
 * The score itself is never gated: `POST /points/calculate/total` stays public
 * and anonymous, and a visitor can see their number without giving a name.
 * This endpoint is the step *after* that — they hand over contact details to
 * find out what the number means and to talk to someone.
 *
 * It puts them on the same funnel spine every other entry point uses: a
 * `prospects` row (which the Calendly link, the booking webhook, Stripe
 * checkout and the admin list all key on) plus a `leads` row for the admin
 * Leads panel and the new-lead notification. That is the whole point — with
 * accounts gone this is the only conversion path on the highest-traffic page,
 * so it must land in the pipeline the agents already watch, not a new one.
 */
@Injectable()
export class PointsCaptureService {
  private readonly logger = new Logger(PointsCaptureService.name);

  constructor(
    private readonly aggregator: PointsAggregatorService,
    private readonly prospectService: ProspectService,
    private readonly summaryService: ProspectSummaryService,
    private readonly leadsService: LeadsService,
    private readonly policyConfig: PolicyConfigService,
  ) {}

  async capture(
    dto: CaptureCalculatorLeadDto,
  ): Promise<CalculatorCaptureResult> {
    if (!dto.consent_given) {
      throw new BadRequestException(
        'Consent is required before we can record your details.',
      );
    }

    // Recomputed, never taken from the client. This is the number an agent
    // will open the call with, so it has to be ours.
    const result = await this.aggregator.calculateTotalPoints(dto.profile);
    const standing = await this.buildStanding(result, dto.profile.age);

    const prospect = await this.createProspect(dto, result, standing);

    // The Leads panel is where the team actually watches for new enquiries.
    // Fire-and-forget: a notification problem must not cost us the capture the
    // person is waiting on a response to.
    this.leadsService
      .create({
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        visa_type: 'Skilled — points tested (189/190/491)',
        message: this.buildLeadMessage(result, standing, prospect?.human_ref),
        source: 'points_calculator',
      })
      .catch((error: Error) => {
        this.logger.error(
          `Failed to create lead for calculator capture ${prospect?.human_ref ?? '(no prospect)'}: ${error.message}`,
        );
      });

    return {
      ...result,
      standing,
      prospect_id: prospect?.id ?? null,
      human_ref: prospect?.human_ref ?? null,
      can_book: Boolean(prospect),
    };
  }

  /**
   * Effective points per featured subclass.
   *
   * Reports the arithmetic and whether it reaches the legislated pass mark —
   * nothing softer. There is no "you are competitive" verdict here on purpose:
   * that would need real invitation-round cut-offs, and the only numbers this
   * product has for those are placeholders. Quoting an invented threshold to
   * someone deciding whether to pay for a consult is the exact problem §1.7
   * exists to prevent.
   */
  private async buildStanding(
    result: StructuredPointsResultDto,
    age: number,
  ): Promise<SubclassStanding[]> {
    const [passMark, stateBonus, regionalBonus] = await Promise.all([
      this.policyConfig.getNumber('points.gsmPassMark', 65),
      this.policyConfig.getNumber('points.stateNominationBonus', 5),
      this.policyConfig.getNumber('points.regionalNominationBonus', 15),
    ]);

    // An applicant at or over the age limit cannot hold any of these, whatever
    // the arithmetic says — so no subclass is reported as passing.
    const ageEligible = age < GSM_MAX_AGE;

    const bonusFor: Record<FeaturedSubclass, number> = {
      '189': 0,
      '190': stateBonus,
      '491': regionalBonus,
    };

    return FEATURED_SUBCLASSES.map((subclass) => {
      const nominationPoints = bonusFor[subclass];
      const effectivePoints = result.totalPoints + nominationPoints;
      return {
        subclass,
        nominationPoints,
        effectivePoints,
        meetsPassMark: ageEligible && effectivePoints >= passMark,
      };
    });
  }

  /**
   * Writes the prospect and the agent prep summary.
   *
   * Never throws. A failed prospect write must not lose the score the person
   * is looking at; the caller degrades to `can_book: false`, which shows a
   * contact-us message instead of a booking button — a visible dead end an
   * agent can rescue, rather than a booking that cannot be paid for.
   */
  private async createProspect(
    dto: CaptureCalculatorLeadDto,
    result: StructuredPointsResultDto,
    standing: SubclassStanding[],
  ) {
    try {
      const prospect = await this.prospectService.create({
        party: 'applicant',
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        source: 'points_calculator',
        visa_interest: 'skilled_189_190_491',
        consent_given: true,
        consent_text: dto.consent_text,
        consent_at: new Date(),
        // The points test is a statutory threshold, so reaching it on any
        // featured subclass is a real answer to the statutory question.
        // `client_fit` stays null — that is a commercial call about budget and
        // complexity, and the calculator asks nothing that would support it.
        statutory_eligible: standing.some((s) => s.meetsPassMark),
        client_fit: null,
        stage: 'pre_screened',
      });

      // The inputs and the score go on the summary, not just the total: the
      // agent needs to see which categories carried the score before the call.
      await this.summaryService.refresh(prospect.id, {
        answers: dto.profile as unknown as Record<string, any>,
        eligibility: {
          statutory_eligible: standing.some((s) => s.meetsPassMark),
          client_fit: null,
          recommended_subclass: '189/190/491',
          total_points: result.totalPoints,
          breakdown: result.breakdown,
          work_cap_applied: result.workCapApplied,
          below_pass_mark: result.belowPassMark,
          ineligibility_reason: result.ineligibilityReason ?? null,
          standing,
          points_current_as_of: result.currentAsOf ?? null,
        },
      });

      return prospect;
    } catch (error) {
      this.logger.error(
        `Failed to create prospect for calculator capture (${dto.email}): ` +
          `${(error as Error).message} — the score was still returned, but this ` +
          `person cannot book until an agent creates the record by hand.`,
      );
      return null;
    }
  }

  private buildLeadMessage(
    result: StructuredPointsResultDto,
    standing: SubclassStanding[],
    humanRef?: string,
  ): string {
    const perSubclass = standing
      .map(
        (s) =>
          `${s.subclass}: ${s.effectivePoints}${s.meetsPassMark ? '' : ' (below pass mark)'}`,
      )
      .join(', ');

    return (
      `Points calculator — ${result.totalPoints} points. ` +
      `With nomination: ${perSubclass}. ` +
      (result.ineligibilityReason ? `${result.ineligibilityReason} ` : '') +
      (humanRef ? `Prospect: ${humanRef}` : 'Prospect record was not created.')
    );
  }
}
