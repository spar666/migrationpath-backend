import { ProspectService } from './prospect.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { ReportBookingDto } from './dto/report-booking.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { ProspectParty, ProspectStage } from './entities/prospect.entity';
export declare class ProspectController {
    private readonly prospectService;
    constructor(prospectService: ProspectService);
    capture(dto: CreateProspectDto): Promise<{
        prospect_id: string;
        human_ref: string;
        stage: ProspectStage;
    }>;
    getPublicStatus(id: string, ref: string): Promise<{
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
    reportBooking(id: string, ref: string, dto: ReportBookingDto): Promise<{
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
    list(query: PaginationQueryDto, stage?: ProspectStage, party?: ProspectParty): Promise<import("../common/repositories/base.repository").PaginatedResult<import("./entities/prospect.entity").Prospect>>;
    getOne(id: string): Promise<{
        prospect: import("./entities/prospect.entity").Prospect;
        summary: import("./entities/prospect-summary.entity").ProspectSummary | null;
    }>;
    getByRef(humanRef: string): Promise<import("./entities/prospect.entity").Prospect>;
    advance(id: string, stage: ProspectStage): Promise<import("./entities/prospect.entity").Prospect>;
}
