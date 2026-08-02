import { SubmitPreScreenDto } from './dto/submit-pre-screen.dto';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { SponsorRepository } from '../employer-sponsored/sponsor.repository';
import { NominationRepository } from '../employer-sponsored/nomination.repository';
import { EmployerSponsoredEngine } from '../employer-sponsored/employer-sponsored.engine';
export interface PreScreenResult {
    prospect_id: string;
    human_ref: string;
    statutory_eligible: boolean;
    client_fit: boolean;
    can_book: boolean;
    recommended_subclass?: string;
    recommended_label?: string;
    reasons: string[];
    blockers: string[];
    next_steps: string[];
}
export declare class PreScreenService {
    private readonly engine;
    private readonly prospectService;
    private readonly summaryService;
    private readonly sponsorRepository;
    private readonly nominationRepository;
    private readonly logger;
    constructor(engine: EmployerSponsoredEngine, prospectService: ProspectService, summaryService: ProspectSummaryService, sponsorRepository: SponsorRepository, nominationRepository: NominationRepository);
    submit(dto: SubmitPreScreenDto): Promise<PreScreenResult>;
    private buildFacts;
    private persistSponsorship;
    private fallbackAnswers;
    private toClientResult;
}
