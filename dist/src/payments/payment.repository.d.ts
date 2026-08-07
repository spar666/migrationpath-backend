import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Payment } from './entities/payment.entity';
export declare class PaymentRepository extends BaseRepository<Payment> {
    private readonly paymentRepository;
    constructor(paymentRepository: Repository<Payment>);
    markPaidWithBooking(paymentId: string, bookingId: string | null, patch: Partial<Payment>): Promise<Payment>;
    findBySessionId(sessionId: string): Promise<Payment | null>;
    findByProspectId(prospectId: string): Promise<Payment[]>;
    hasPaidFor(prospectId: string, purpose: Payment['purpose']): Promise<boolean>;
    findOpenSessionForBooking(bookingId: string, maxAgeMs: number): Promise<Payment | null>;
    findStaleOpenSessions(olderThanMs: number, limit?: number): Promise<Payment[]>;
}
