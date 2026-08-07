import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { ProspectSummaryRepository } from './prospect-summary.repository';
import { ProspectRepository } from './prospect.repository';
import { ProspectSummary } from './entities/prospect-summary.entity';
import { SponsorRepository } from '../employer-sponsored/sponsor.repository';
import { NominationRepository } from '../employer-sponsored/nomination.repository';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';

/**
 * Patch applied on top of whatever refresh() can rebuild from the database.
 *
 * Anything the caller already holds in memory (the engine result it just
 * computed, the Stripe payment row it just wrote) is passed in rather than
 * re-queried. Keys not supplied are left as they were — this is a merge, not
 * an overwrite, so a payment webhook does not wipe the engine result.
 */
export interface SummaryPatch {
  answers?: Record<string, any>;
  engine_result?: Record<string, any>;
  eligibility?: Record<string, any>;
  payment?: Record<string, any>;
  booking?: Record<string, any>;
}

/**
 * Maintains the agent prep read-model.
 *
 * This table is derived, never authoritative. If it is ever wrong, the fix is
 * to call refresh() again — nothing reads it to make a decision, only to show
 * a human what they are walking into.
 */
@Injectable()
export class ProspectSummaryService {
  private readonly logger = new Logger(ProspectSummaryService.name);

  constructor(
    private readonly summaryRepository: ProspectSummaryRepository,
    private readonly prospectRepository: ProspectRepository,
    private readonly sponsorRepository: SponsorRepository,
    private readonly nominationRepository: NominationRepository,
    private readonly bookingRepository: ConsultationBookingRepository,
    // The TypeORM repository rather than PaymentRepository: PaymentsModule
    // already imports ProspectModule, so depending on it here would close the
    // loop. The entity is all this needs.
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
  ) {}

  get(prospectId: string): Promise<ProspectSummary | null> {
    return this.summaryRepository.findByProspectId(prospectId);
  }

  /**
   * Rebuild the summary for one prospect.
   *
   * Never throws at the caller. A failed summary rebuild must not fail the
   * submission or the webhook that triggered it — the prospect record is the
   * source of truth and this is a convenience view.
   */
  async refresh(
    prospectId: string,
    patch: SummaryPatch = {},
  ): Promise<ProspectSummary | null> {
    try {
      const prospect = await this.prospectRepository.findOneById(prospectId);
      if (!prospect) {
        this.logger.warn(
          `refresh() called for unknown prospect ${prospectId} — skipping`,
        );
        return null;
      }

      const sponsorship = await this.buildSponsorship(prospect.sponsor_id);
      const booking = patch.booking ?? (await this.buildBooking(prospectId));
      const payment = patch.payment ?? (await this.buildPayment(prospectId));

      const eligibility =
        patch.eligibility ??
        (patch.engine_result
          ? {
              statutory_eligible: patch.engine_result.statutory_eligible,
              client_fit: patch.engine_result.client_fit,
              recommended_subclass: patch.engine_result.recommended_subclass,
              reasons: patch.engine_result.reasons,
              blockers: patch.engine_result.blockers,
              open_questions: patch.engine_result.open_questions,
            }
          : {
              statutory_eligible: prospect.statutory_eligible,
              client_fit: prospect.client_fit,
            });

      return await this.summaryRepository.upsert(prospectId, {
        headline: this.buildHeadline(
          prospect.full_name,
          prospect.party,
          prospect.company_name,
          eligibility?.recommended_subclass,
        ),
        eligibility,
        ...(patch.answers !== undefined ? { answers: patch.answers } : {}),
        ...(patch.engine_result !== undefined
          ? { engine_result: patch.engine_result }
          : {}),
        ...(sponsorship ? { sponsorship } : {}),
        ...(booking ? { booking } : {}),
        ...(payment ? { payment } : {}),
      });
    } catch (error) {
      this.logger.error(
        `Failed to refresh summary for prospect ${prospectId}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  // -------------------------------------------------------------------------

  private buildHeadline(
    fullName: string,
    party: string,
    companyName?: string,
    subclass?: string,
  ): string {
    const who =
      party === 'business' && companyName
        ? `${companyName} (${fullName})`
        : fullName;
    const what = subclass ? `subclass ${subclass}` : 'pathway TBC';
    return `${who} — ${party} — ${what}`;
  }

  private async buildSponsorship(
    sponsorId?: string | null,
  ): Promise<Record<string, any> | null> {
    if (!sponsorId) return null;

    const sponsor = await this.sponsorRepository.findWithNominations(sponsorId);
    if (!sponsor) return null;

    const nominations =
      sponsor.nominations ??
      (await this.nominationRepository.findBySponsorId(sponsorId));

    return {
      sponsor: {
        id: sponsor.id,
        legal_name: sponsor.legal_name,
        abn: sponsor.abn,
        industry: sponsor.industry,
        employee_count: sponsor.employee_count,
        years_trading: sponsor.years_trading,
        sponsorship_status: sponsor.sponsorship_status,
        state: sponsor.state,
      },
      nominations: (nominations ?? []).map((n) => ({
        id: n.id,
        occupation_code: n.occupation_code,
        occupation_name: n.occupation_name,
        subclass: n.subclass,
        annual_salary: n.annual_salary,
        work_state: n.work_state,
        is_regional: n.is_regional,
        status: n.status,
        applicant_prospect_id: n.applicant_prospect_id,
      })),
    };
  }

  /**
   * The prospect's latest payment, read from the payments table.
   *
   * This existed only as a caller-supplied patch, written by exactly one code
   * path — the Stripe webhook. Which contradicted the class comment: the
   * summary is derived, and "if it is ever wrong, call refresh() again" was
   * not true of this block. A prospect whose webhook failed showed "no payment
   * recorded" in the agent view permanently, however many times it refreshed,
   * because nothing could rebuild it from the source of truth.
   *
   * Now it works the same way as the booking block above.
   */
  private async buildPayment(
    prospectId: string,
  ): Promise<Record<string, any> | null> {
    const [payment] = await this.payments.find({
      where: { prospect_id: prospectId },
      // A paid row is the answer whenever one exists, even if a later attempt
      // was created afterwards — ordering by creation alone would let an
      // abandoned retry hide a completed payment.
      order: { paid_at: 'DESC', created_at: 'DESC' },
      take: 1,
    });

    if (!payment) return null;

    return {
      payment_id: payment.id,
      status: payment.status,
      amount_cents: payment.amount_cents,
      currency: payment.currency,
      paid_at: payment.paid_at,
    };
  }

  private async buildBooking(
    prospectId: string,
  ): Promise<Record<string, any> | null> {
    const bookings = await this.bookingRepository.findAll({
      prospect_id: prospectId,
    });
    if (!bookings?.length) return null;

    // Most recent first — a rescheduled prospect has more than one row.
    const [booking] = bookings.sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime(),
    );

    return {
      booking_id: booking.id,
      status: booking.status,
      scheduled_at: booking.scheduled_at,
      scheduled_end_at: booking.scheduled_end_at,
      join_url: booking.join_url,
      reschedule_url: booking.reschedule_url,
      cancel_url: booking.cancel_url,
      // What they typed into Calendly, which is not necessarily the address
      // they enquired with. People book with a work email having enquired from
      // a personal one, and that mismatch is the usual reason a booking cannot
      // be tied to an enquiry by hand — so it is shown rather than assumed
      // away. Also the ONLY contact detail an unlinked booking has.
      invitee_email: booking.invitee_email,
      invitee_name: booking.invitee_name,
    };
  }
}
