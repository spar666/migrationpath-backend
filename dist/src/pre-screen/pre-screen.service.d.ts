import { OnModuleInit } from '@nestjs/common';
import { SubmitPreScreenDto } from './dto/submit-pre-screen.dto';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { OccupationsService } from '../occupations/occupations.service';
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
export declare class PreScreenService implements OnModuleInit {
    private readonly engine;
    private readonly prospectService;
    private readonly summaryService;
    private readonly occupationsService;
    private readonly sponsorRepository;
    private readonly nominationRepository;
    private readonly logger;
    constructor(engine: EmployerSponsoredEngine, prospectService: ProspectService, summaryService: ProspectSummaryService, occupationsService: OccupationsService, sponsorRepository: SponsorRepository, nominationRepository: NominationRepository);
    onModuleInit(): void;
    submit(dto: SubmitPreScreenDto): Promise<PreScreenResult>;
    private buildFacts;
    private persistSponsorship;
    private fallbackAnswers;
    private toClientResult;
}
