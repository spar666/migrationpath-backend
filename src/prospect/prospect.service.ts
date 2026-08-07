import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { ProspectRepository } from './prospect.repository';
import { ProspectSummaryService } from './prospect-summary.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';
import {
  Prospect,
  ProspectParty,
  ProspectStage,
} from './entities/prospect.entity';

/**
 * Unambiguous alphabet for the human reference — no 0/O, no 1/I/L. These get
 * read out over the phone and written on notepads, so the characters people
 * confuse are simply not in the set.
 */
const REF_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const REF_LENGTH = 6;
const REF_PREFIX = 'MP-';
const REF_MAX_ATTEMPTS = 8;

/**
 * Owns the funnel spine: the prospect record every other module attaches to.
 *
 * Anything that captures a human — the pre-screen questionnaire, a calculator,
 * an agent creating a record by hand — comes through here so there is exactly
 * one place that knows how a prospect is created and how its stage advances.
 */
@Injectable()
export class ProspectService {
  private readonly logger = new Logger(ProspectService.name);

  constructor(
    private readonly prospectRepository: ProspectRepository,
    private readonly summaryService: ProspectSummaryService,
    private readonly bookingRepository: ConsultationBookingRepository,
  ) {}

  /**
   * Lightweight capture used by calculators and other verticals. Does NOT run
   * the eligibility engine — the employer-sponsored questionnaire uses
   * PreScreenService for that.
   */
  async capture(dto: CreateProspectDto): Promise<Prospect> {
    if (!dto.consent_given) {
      // Refusing here rather than storing consent_given=false is deliberate:
      // we should not hold personal information we were not given permission
      // to collect. See §7.
      throw new BadRequestException(
        'Consent is required before we can record your details.',
      );
    }

    const prospect = await this.create({
      party: dto.party ?? 'applicant',
      full_name: dto.full_name,
      email: dto.email,
      phone: dto.phone,
      company_name: dto.company_name,
      source: dto.source ?? 'capture',
      visa_interest: dto.visa_interest,
      consent_given: true,
      consent_text: dto.consent_text,
      consent_at: new Date(),
      stage: 'captured',
    });

    await this.summaryService.refresh(prospect.id, {
      answers: dto.answers ?? undefined,
    });

    return prospect;
  }

  /**
   * Low-level create. Generates the human reference and normalises the email.
   * Callers that need engine flags set should use `create` then `applyScreen`.
   */
  async create(data: Partial<Prospect>): Promise<Prospect> {
    const human_ref = await this.generateHumanRef();

    return this.prospectRepository.create({
      ...data,
      human_ref,
      email: data.email?.toLowerCase(),
    });
  }

  async findById(id: string): Promise<Prospect> {
    const prospect = await this.prospectRepository.findOneById(id);
    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }
    return prospect;
  }

  async findByHumanRef(humanRef: string): Promise<Prospect> {
    const prospect = await this.prospectRepository.findByHumanRef(humanRef);
    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }
    return prospect;
  }

  /**
   * Record the outcome of a pre-screen. Note the two flags are set
   * independently — see the comment on the entity for why.
   */
  async applyScreen(
    prospectId: string,
    flags: { statutory_eligible: boolean; client_fit: boolean },
  ): Promise<Prospect> {
    return this.prospectRepository.update(prospectId, {
      statutory_eligible: flags.statutory_eligible,
      client_fit: flags.client_fit,
      stage: 'pre_screened',
    });
  }

  /**
   * Move the prospect forward. Never moves it backward: a booked prospect
   * whose Calendly webhook replays must not drop back to pre_screened.
   */
  async advanceStage(
    prospectId: string,
    stage: ProspectStage,
  ): Promise<Prospect> {
    const prospect = await this.findById(prospectId);
    if (STAGE_ORDER[stage] <= STAGE_ORDER[prospect.stage]) {
      this.logger.debug(
        `Not advancing prospect ${prospect.human_ref} from ${prospect.stage} to ${stage}`,
      );
      return prospect;
    }
    return this.prospectRepository.update(prospectId, { stage });
  }

  async linkSponsor(prospectId: string, sponsorId: string): Promise<Prospect> {
    return this.prospectRepository.update(prospectId, {
      sponsor_id: sponsorId,
    });
  }

  async list(
    page = 1,
    limit = 20,
    filters?: { stage?: ProspectStage; party?: ProspectParty },
  ) {
    return this.prospectRepository.paginate(page, limit, filters);
  }

  /**
   * Everything the agent needs before the call, in one call.
   */
  async getPrepView(prospectId: string) {
    const prospect = await this.findById(prospectId);
    const summary = await this.summaryService.get(prospectId);
    return { prospect, summary };
  }

  /**
   * The narrow, unauthenticated view the prospect's own browser may read.
   *
   * This exists because landing on the Stripe success URL does NOT mean the
   * payment succeeded — it is a browser navigation, and the booking is only
   * really confirmed once Stripe's webhook lands a moment later. The return
   * page has to read actual state instead of announcing success on arrival,
   * and an anonymous prospect has no token to read it with.
   *
   * Two things keep that safe. The caller must present the human_ref as well
   * as the uuid, so guessing one identifier is not enough; and the payload is
   * deliberately thin — funnel state and the prospect's own booking links,
   * never the questionnaire, the summary, or anyone's contact details.
   *
   * The mismatch case throws NotFound rather than Forbidden on purpose: a
   * "wrong reference" response would confirm that the id exists.
   */
  async getPublicStatus(prospectId: string, humanRef: string) {
    const prospect = await this.prospectRepository.findOneById(prospectId);

    if (
      !prospect ||
      !humanRef ||
      prospect.human_ref.toUpperCase() !== humanRef.trim().toUpperCase()
    ) {
      throw new NotFoundException('Prospect not found');
    }

    const booking =
      await this.bookingRepository.findLatestForProspect(prospectId);

    return {
      prospect_id: prospect.id,
      human_ref: prospect.human_ref,
      stage: prospect.stage,
      statutory_eligible: prospect.statutory_eligible ?? null,
      client_fit: prospect.client_fit ?? null,
      // 'booked' is set only after the fee is paid AND the slot is held, so it
      // is the one flag the confirmation page should trust.
      consult_confirmed: prospect.stage === 'booked',
      booking: booking
        ? {
            id: booking.id,
            status: booking.status,
            scheduled_at: booking.scheduled_at ?? null,
            scheduled_end_at: booking.scheduled_end_at ?? null,
            join_url: booking.join_url ?? null,
            reschedule_url: booking.reschedule_url ?? null,
            cancel_url: booking.cancel_url ?? null,
          }
        : null,
    };
  }

  /**
   * Records a booking the prospect's own browser just watched Calendly confirm.
   *
   * This exists because the invitee webhook is not reliably available at the
   * moment it is needed. It is a server-to-server call: late under load, silent
   * when the subscription or signing key is wrong, and impossible in local
   * development where Calendly has no public URL to deliver to. Without a
   * booking row, checkout has nothing to attach the payment to and rejects the
   * request — so a webhook problem reaches the visitor as "we have no record of
   * the time you just booked".
   *
   * What this endpoint is trusted for is narrow, and deliberately so. It
   * creates a PENDING booking and nothing else. It cannot confirm anything —
   * that remains Stripe's webhook alone — and it cannot move the prospect
   * forward. The worst a stranger holding both identifiers can do is add an
   * unpaid row to the agent's follow-up queue.
   *
   * The details it stores are the browser's account of events and are treated
   * as provisional: `client_reported_at` marks the row so the invitee webhook
   * overwrites them with Calendly's own data when it arrives.
   */
  async reportBooking(
    prospectId: string,
    humanRef: string,
    details: {
      inviteeUri?: string;
      eventUri?: string;
      startsAt?: string;
      endsAt?: string;
    } = {},
  ) {
    // Validates identity and 404s on a mismatch before anything is written.
    const status = await this.getPublicStatus(prospectId, humanRef);

    // Already have a slot: the webhook beat us, or this is a double-report from
    // a re-rendered page. Either way, creating a second row for one booking
    // would leave the agent guessing which is real.
    if (status.booking) {
      return status;
    }

    const startsAt = toDateOrNull(details.startsAt);

    await this.bookingRepository.create({
      prospect_id: prospectId,
      user_id: null,
      status: 'pending',
      scheduler_provider: 'calendly',
      // Only set when the browser actually saw it. A synthetic value here would
      // break the webhook's idempotency key, which is the real invitee URI.
      scheduler_event_id: details.inviteeUri ?? null,
      scheduler_invitee_id: details.eventUri ?? null,
      scheduled_at: startsAt,
      scheduled_end_at: toDateOrNull(details.endsAt),
      client_reported_at: new Date(),
    });

    this.logger.log(
      `Booking reported by the browser for prospect ${humanRef}` +
        `${startsAt ? ` at ${startsAt.toISOString()}` : ''}. ` +
        `Awaiting the Calendly webhook to confirm the detail.`,
    );

    await this.summaryService.refresh(prospectId);

    return this.getPublicStatus(prospectId, humanRef);
  }

  // -------------------------------------------------------------------------

  /**
   * Six characters from a 31-character alphabet is ~887 million values, so
   * collisions are rare — but "rare" is not "never" and a duplicate would be
   * a unique-constraint 500 in the middle of a submission, so we retry.
   */
  private async generateHumanRef(): Promise<string> {
    for (let attempt = 0; attempt < REF_MAX_ATTEMPTS; attempt++) {
      const candidate =
        REF_PREFIX +
        Array.from(
          { length: REF_LENGTH },
          () => REF_ALPHABET[randomInt(REF_ALPHABET.length)],
        ).join('');

      if (!(await this.prospectRepository.humanRefExists(candidate))) {
        return candidate;
      }
      this.logger.warn(`human_ref collision on ${candidate}, retrying`);
    }
    // Fall back to something guaranteed unique rather than failing the
    // submission — a slightly ugly reference beats a lost lead.
    return `${REF_PREFIX}${Date.now().toString(36).toUpperCase()}`;
  }
}

/**
 * Monotonic ordering used by advanceStage(). `disqualified` sits at the top
 * because it is terminal — an agent marking someone disqualified should not
 * be undone by a late webhook.
 */
/** Parses an ISO string the browser supplied, refusing anything unparseable. */
function toDateOrNull(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const STAGE_ORDER: Record<ProspectStage, number> = {
  captured: 0,
  pre_screened: 1,
  booked: 2,
  consulted: 3,
  engaged: 4,
  disqualified: 5,
};
