import { ConsultationQuestionnaireRepository, ConsultationBookingRepository } from './consultation.repository';
import { ConsultationQuestionnaire, ConsultationBooking } from './entities/consultation.entity';
import { PaginatedResult } from '../common/repositories/base.repository';
export declare class ConsultationService {
    private readonly questionnaireRepo;
    private readonly bookingRepo;
    constructor(questionnaireRepo: ConsultationQuestionnaireRepository, bookingRepo: ConsultationBookingRepository);
    submitQuestionnaire(userId: string, responses: Record<string, any>): Promise<ConsultationQuestionnaire>;
    findMyQuestionnaire(userId: string): Promise<ConsultationQuestionnaire[]>;
    findAllQuestionnaires(page: number, limit: number): Promise<PaginatedResult<ConsultationQuestionnaire>>;
    findAllBookings(page: number, limit: number): Promise<PaginatedResult<ConsultationBooking>>;
    deliverStrategy(id: string, strategy: string): Promise<ConsultationBooking>;
    deleteBooking(id: string): Promise<void>;
}
