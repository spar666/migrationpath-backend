import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PointsAggregatorService } from './points-aggregator.service';
import { CaptureCalculatorLeadDto } from './dto/capture-lead.dto';
import { StructuredPointsResultDto } from './dto/user-profile.dto';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { PolicyConfigService } from '../policy-config/policy-config.service';

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

/** Captures one prospect with the server-calculated score and answers. */
@Injectable()
export class PointsCaptureService {
  private readonly logger = new Logger(PointsCaptureService.name);

  constructor(
    private readonly aggregator: PointsAggregatorService,
    private readonly prospectService: ProspectService,
    private readonly summaryService: ProspectSummaryService,
    private readonly policyConfig: PolicyConfigService,
  ) {}

  async capture(
    dto: CaptureCalculatorLeadDto,
  ): Promise<CalculatorCaptureResult> {
    if (!dto.consent_given || !dto.consent_text?.trim()) {
      throw new BadRequestException(
        'Consent is required before we can record your details.',
      );
    }

    // Recomputed, never taken from the client. This is the number an agent
    // will open the call with, so it has to be ours.
    const result = await this.aggregator.calculateTotalPoints(dto.profile);
    const standing = await this.buildStanding(result, dto.profile.age);

    const prospect = await this.createProspect(dto, result, standing);

    return {
      ...result,
      standing,
      prospect_id: prospect?.id ?? null,
      human_ref: prospect?.human_ref ?? null,
      can_book: prospect?.statutory_eligible === true && prospect?.client_fit === true,
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
      this.policyConfig.getRequiredNumber('points.gsmPassMark'),
      this.policyConfig.getRequiredNumber('points.stateNominationBonus'),
      this.policyConfig.getRequiredNumber('points.regionalNominationBonus'),
    ]);

    // An applicant at or over the age limit cannot hold any of these, whatever
    // the arithmetic says — so no subclass is reported as passing.
    const ageEligible =
      age < await this.policyConfig.getRequiredNumber('points.gsmMaxAge');

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
        captured_answers: dto.profile as unknown as Record<string, unknown>,
        outcome_tag: 'review_required',
        gap_codes: ['client_fit_review'],
        rma_review_flags: [],
        risk_flags: [],
        attribution: dto.attribution,
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

}
