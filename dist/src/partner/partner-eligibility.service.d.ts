import { Repository } from 'typeorm';
import { PartnerEligibilitySubmission } from './entities/partner-eligibility-submission.entity';
import { PartnerEligibilityEngine, EligibilityResult } from './partner-eligibility.engine';
import { PartnerEligibilityDto } from './dto/partner-eligibility.dto';
import { LeadsService } from '../leads/leads.service';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
export interface PartnerEligibilityResponse extends EligibilityResult {
    id: string;
    applicantFirstName: string;
    sponsorFirstName: string;
    prospect_id: string | null;
    human_ref: string | null;
    can_book: boolean;
}
export declare class PartnerEligibilityService {
    private readonly submissions;
    private readonly engine;
    private readonly leadsService;
    private readonly prospectService;
    private readonly summaryService;
    private readonly logger;
    constructor(submissions: Repository<PartnerEligibilitySubmission>, engine: PartnerEligibilityEngine, leadsService: LeadsService, prospectService: ProspectService, summaryService: ProspectSummaryService);
    submit(dto: PartnerEligibilityDto): Promise<PartnerEligibilityResponse>;
    private createProspect;
    findAll(page: number, limit: number): Promise<{
        data: PartnerEligibilitySubmission[];
        total: number;
        page: number;
        limit: number;
    }>;
}
