import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Payment } from './entities/payment.entity';
export declare class PaymentRepository extends BaseRepository<Payment> {
    private readonly paymentRepository;
    constructor(paymentRepository: Repository<Payment>);
    findBySessionId(sessionId: string): Promise<Payment | null>;
    findByProspectId(prospectId: string): Promise<Payment[]>;
    hasPaidFor(prospectId: string, purpose: Payment['purpose']): Promise<boolean>;
}
