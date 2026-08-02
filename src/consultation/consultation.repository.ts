import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository, PaginatedResult } from '../common/repositories/base.repository';
import {
  ConsultationQuestionnaire,
  ConsultationBooking,
} from './entities/consultation.entity';

@Injectable()
export class ConsultationQuestionnaireRepository extends BaseRepository<ConsultationQuestionnaire> {
  constructor(
    @InjectRepository(ConsultationQuestionnaire)
    private readonly questionnaireRepository: Repository<ConsultationQuestionnaire>,
  ) {
    super(questionnaireRepository);
  }

  async findLatestByUserId(
    userId: string,
  ): Promise<ConsultationQuestionnaire[]> {
    return this.repository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.full_name'])
      .where('q.user_id = :userId', { userId })
      .orderBy('q.created_at', 'DESC')
      .take(1)
      .getMany();
  }

  async paginateWithUser(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<ConsultationQuestionnaire>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.full_name'])
      .orderBy('q.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

@Injectable()
export class ConsultationBookingRepository extends BaseRepository<ConsultationBooking> {
  constructor(
    @InjectRepository(ConsultationBooking)
    private readonly bookingRepository: Repository<ConsultationBooking>,
  ) {
    super(bookingRepository);
  }

  async deliverStrategy(
    id: string,
    strategy: string,
  ): Promise<ConsultationBooking> {
    return this.update(id, {
      strategy_delivery: strategy,
      status: 'completed',
    });
  }

  /**
   * Look up by the scheduler's own id. This is how a Calendly webhook finds
   * the row it already created — invitee.created and invitee.canceled both
   * carry the same invitee URI, and providers replay webhooks, so matching on
   * this rather than on (prospect, time) is what makes replays harmless.
   */
  findBySchedulerEventId(
    schedulerEventId: string,
  ): Promise<ConsultationBooking | null> {
    return this.bookingRepository.findOne({
      where: { scheduler_event_id: schedulerEventId },
    });
  }

  findByProspectId(prospectId: string): Promise<ConsultationBooking[]> {
    return this.bookingRepository.find({
      where: { prospect_id: prospectId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * The most recent slot a prospect holds. Used by checkout to work out which
   * booking the payment is confirming.
   */
  async findLatestForProspect(
    prospectId: string,
  ): Promise<ConsultationBooking | null> {
    const [latest] = await this.bookingRepository.find({
      where: { prospect_id: prospectId },
      order: { created_at: 'DESC' },
      take: 1,
    });
    return latest ?? null;
  }
}
