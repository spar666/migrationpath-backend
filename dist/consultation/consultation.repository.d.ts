import { Repository } from 'typeorm';
import { BaseRepository, PaginatedResult } from '../common/repositories/base.repository';
import { ConsultationQuestionnaire, ConsultationBooking } from './entities/consultation.entity';
export declare class ConsultationQuestionnaireRepository extends BaseRepository<ConsultationQuestionnaire> {
    private readonly questionnaireRepository;
    constructor(questionnaireRepository: Repository<ConsultationQuestionnaire>);
    findLatestByUserId(userId: string): Promise<ConsultationQuestionnaire[]>;
    paginateWithUser(page?: number, limit?: number): Promise<PaginatedResult<ConsultationQuestionnaire>>;
}
export declare class ConsultationBookingRepository extends BaseRepository<ConsultationBooking> {
    private readonly bookingRepository;
    constructor(bookingRepository: Repository<ConsultationBooking>);
    deliverStrategy(id: string, strategy: string): Promise<ConsultationBooking>;
}
