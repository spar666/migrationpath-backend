import { ConsultationService } from './consultation.service';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import { DeliverStrategyDto } from './dto/deliver-strategy.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
export declare class ConsultationController {
    private readonly consultationService;
    constructor(consultationService: ConsultationService);
    submitQuestionnaire(user: AuthUser, dto: SubmitQuestionnaireDto): Promise<import("./entities/consultation.entity").ConsultationQuestionnaire>;
    findMyQuestionnaire(user: AuthUser): Promise<import("./entities/consultation.entity").ConsultationQuestionnaire[]>;
    findUserQuestionnaire(userId: string): Promise<import("./entities/consultation.entity").ConsultationQuestionnaire[]>;
    findAllQuestionnaires(query: PaginationQueryDto): Promise<import("../common/repositories/base.repository").PaginatedResult<import("./entities/consultation.entity").ConsultationQuestionnaire>>;
    findAll(query: PaginationQueryDto): Promise<import("../common/repositories/base.repository").PaginatedResult<import("./entities/consultation.entity").ConsultationBooking>>;
    deliverStrategy(id: string, dto: DeliverStrategyDto): Promise<import("./entities/consultation.entity").ConsultationBooking>;
    remove(id: string): Promise<void>;
}
