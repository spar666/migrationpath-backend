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
}
