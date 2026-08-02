import { ProspectRepository } from './prospect.repository';
import { ProspectSummaryService } from './prospect-summary.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';
import { Prospect, ProspectParty, ProspectStage } from './entities/prospect.entity';
export declare class ProspectService {
    private readonly prospectRepository;
    private readonly summaryService;
    private readonly bookingRepository;
    private readonly logger;
    constructor(prospectRepository: ProspectRepository, summaryService: ProspectSummaryService, bookingRepository: ConsultationBookingRepository);
    capture(dto: CreateProspectDto): Promise<Prospect>;
    create(data: Partial<Prospect>): Promise<Prospect>;
    findById(id: string): Promise<Prospect>;
    findByHumanRef(humanRef: string): Promise<Prospect>;
    applyScreen(prospectId: string, flags: {
        statutory_eligible: boolean;
        client_fit: boolean;
    }): Promise<Prospect>;
    advanceStage(prospectId: string, stage: ProspectStage): Promise<Prospect>;
    linkSponsor(prospectId: string, sponsorId: string): Promise<Prospect>;
    list(page?: number, limit?: number, filters?: {
        stage?: ProspectStage;
        party?: ProspectParty;
    }): Promise<import("../common/repositories/base.repository").PaginatedResult<Prospect>>;
    getPrepView(prospectId: string): Promise<{
        prospect: Prospect;
        summary: import("./entities/prospect-summary.entity").ProspectSummary | null;
    }>;
    getPublicStatus(prospectId: string, humanRef: string): Promise<{
        prospect_id: string;
        human_ref: string;
        stage: ProspectStage;
        statutory_eligible: boolean | null;
        client_fit: boolean | null;
        consult_confirmed: boolean;
        booking: {
            id: string;
            status: import("../consultation/entities/consultation.entity").ConsultationBookingStatus;
            scheduled_at: Date | null;
            scheduled_end_at: Date | null;
            join_url: string | null;
            reschedule_url: string | null;
            cancel_url: string | null;
        } | null;
    }>;
    private generateHumanRef;
}
