import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Payment } from './entities/payment.entity';
import { ConsultationBooking } from '../consultation/entities/consultation.entity';

@Injectable()
export class PaymentRepository extends BaseRepository<Payment> {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    super(paymentRepository);
  }

  /**
   * Marks a payment paid and its booking confirmed in one transaction.
   *
   * These two writes are the pair that must not come apart. Between them sits
   * the only state the system cannot explain: money taken, no confirmed
   * booking, and nothing to indicate anything went wrong. A crash in that gap
   * used to leave it permanently, because the retry saw a paid payment and
   * concluded there was nothing to do.
   *
   * The retry path is now able to repair it, but repairing it depends on a
   * webhook being redelivered — and Stripe eventually stops. A transaction
   * removes the window rather than relying on someone else to notice it.
   *
   * Returns the updated payment. The booking id is optional because a payment
   * can legitimately arrive with no booking attached (see the webhook handler),
   * and that case still needs the payment recorded.
   */
  async markPaidWithBooking(
    paymentId: string,
    bookingId: string | null,
    patch: Partial<Payment>,
  ): Promise<Payment> {
    return this.paymentRepository.manager.transaction(async (manager) => {
      await manager.update(Payment, paymentId, patch);

      if (bookingId) {
        await manager.update(ConsultationBooking, bookingId, {
          status: 'confirmed',
        });
      }

      const updated = await manager.findOne(Payment, {
        where: { id: paymentId },
      });
      if (!updated) {
        // Rolls the transaction back. A payment row that vanished mid-update
        // is not something to paper over.
        throw new Error(`Payment ${paymentId} disappeared during confirmation`);
      }
      return updated;
    });
  }

  findBySessionId(sessionId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { provider_session_id: sessionId },
    });
  }

  findByProspectId(prospectId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { prospect_id: prospectId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Has this prospect already paid for this?
   *
   * A convenience check, NOT the guarantee. It is a read followed by a write,
   * so two checkouts started at the same moment both pass it. The actual
   * guarantee is the partial unique index on (prospect_id, purpose) where
   * status = 'paid' — see HardenPaymentIdempotency. This exists so the second
   * one gets a civil error instead of a constraint violation.
   */
  async hasPaidFor(
    prospectId: string,
    purpose: Payment['purpose'],
  ): Promise<boolean> {
    const count = await this.paymentRepository.count({
      where: { prospect_id: prospectId, purpose, status: 'paid' },
    });
    return count > 0;
  }

  /**
   * A checkout session already open for this booking.
   *
   * Reused rather than replaced, because every session we create is a live,
   * chargeable link. A visitor who reloads the payment page, or whose first
   * attempt died between our row being written and Stripe answering, would
   * otherwise accumulate several — and any of them can still be paid. Handing
   * back the existing one keeps it to a single way to pay for a single slot.
   *
   * Bounded by age: Stripe expires sessions (24h by default), and returning a
   * URL that has quietly stopped working is worse than making a new one.
   */
  async findOpenSessionForBooking(
    bookingId: string,
    maxAgeMs: number,
  ): Promise<Payment | null> {
    const [open] = await this.paymentRepository.find({
      where: {
        booking_id: bookingId,
        status: 'created',
        provider_session_id: Not(IsNull()),
        created_at: MoreThan(new Date(Date.now() - maxAgeMs)),
      },
      order: { created_at: 'DESC' },
      take: 1,
    });
    return open ?? null;
  }

  /**
   * Sessions old enough that nobody is coming back to them.
   *
   * Fed to the reconciliation sweep, which checks each against Stripe before
   * writing it off — an abandoned checkout and a payment whose webhook never
   * reached us look identical from this side of the wire.
   */
  findStaleOpenSessions(olderThanMs: number, limit = 100): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: {
        status: 'created',
        provider_session_id: Not(IsNull()),
        created_at: LessThan(new Date(Date.now() - olderThanMs)),
      },
      order: { created_at: 'ASC' },
      take: limit,
    });
  }
}
