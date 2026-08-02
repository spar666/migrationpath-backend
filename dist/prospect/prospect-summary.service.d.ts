import { ProspectSummaryRepository } from './prospect-summary.repository';
import { ProspectRepository } from './prospect.repository';
import { ProspectSummary } from './entities/prospect-summary.entity';
import { SponsorRepository } from '../employer-sponsored/sponsor.repository';
import { NominationRepository } from '../employer-sponsored/nomination.repository';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';
export interface SummaryPatch {
    answers?: Record<string, any>;
    engine_result?: Record<string, any>;
    eligibility?: Record<string, any>;
    payment?: Record<string, any>;
    booking?: Record<string, any>;
}
export declare class ProspectSummaryService {
    private readonly summaryRepository;
    private readonly prospectRepository;
    private readonly sponsorRepository;
    private readonly nominationRepository;
    private readonly bookingRepository;
    private readonly logger;
    constructor(summaryRepository: ProspectSummaryRepository, prospectRepository: ProspectRepository, sponsorRepository: SponsorRepository, nominationRepository: NominationRepository, bookingRepository: ConsultationBookingRepository);
    get(prospectId: string): Promise<ProspectSummary | null>;
    refresh(prospectId: string, patch?: SummaryPatch): Promise<ProspectSummary | null>;
    private buildHeadline;
    private buildSponsorship;
    private buildBooking;
}
