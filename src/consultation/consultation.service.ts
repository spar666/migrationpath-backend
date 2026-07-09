import { Injectable } from '@nestjs/common';
import {
  ConsultationQuestionnaireRepository,
  ConsultationBookingRepository,
} from './consultation.repository';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import {
  ConsultationQuestionnaire,
  ConsultationBooking,
} from './entities/consultation.entity';
import { PaginatedResult } from '../common/repositories/base.repository';

@Injectable()
export class ConsultationService {
  constructor(
    private readonly questionnaireRepo: ConsultationQuestionnaireRepository,
    private readonly bookingRepo: ConsultationBookingRepository,
  ) {}

  async submitQuestionnaire(
    userId: string,
    responses: Record<string, any>,
  ): Promise<ConsultationQuestionnaire> {
    return this.questionnaireRepo.create({
      user_id: userId,
      responses,
    });
  }

  async findMyQuestionnaire(
    userId: string,
  ): Promise<ConsultationQuestionnaire[]> {
    return this.questionnaireRepo.findLatestByUserId(userId);
  }

  async findAllQuestionnaires(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ConsultationQuestionnaire>> {
    return this.questionnaireRepo.paginateWithUser(page, limit);
  }

  async findAllBookings(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ConsultationBooking>> {
    return this.bookingRepo.paginate(page, limit);
  }

  async deliverStrategy(
    id: string,
    strategy: string,
  ): Promise<ConsultationBooking> {
    return this.bookingRepo.deliverStrategy(id, strategy);
  }

  async deleteBooking(id: string): Promise<void> {
    return this.bookingRepo.hardDelete(id);
  }
}
