import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentRepository extends BaseRepository<Payment> {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    super(paymentRepository);
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

  async hasPaidFor(
    prospectId: string,
    purpose: Payment['purpose'],
  ): Promise<boolean> {
    const count = await this.paymentRepository.count({
      where: { prospect_id: prospectId, purpose, status: 'paid' },
    });
    return count > 0;
  }
}
