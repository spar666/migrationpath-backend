import { Repository } from 'typeorm';
import { PartnerEligibilitySubmission } from './entities/partner-eligibility-submission.entity';
import { PartnerEligibilityEngine, EligibilityResult } from './partner-eligibility.engine';
import { PartnerEligibilityDto } from './dto/partner-eligibility.dto';
import { LeadsService } from '../leads/leads.service';
export interface PartnerEligibilityResponse extends EligibilityResult {
    id: string;
    applicantFirstName: string;
    sponsorFirstName: string;
}
export declare class PartnerEligibilityService {
    private readonly submissions;
    private readonly engine;
    private readonly leadsService;
    private readonly logger;
    constructor(submissions: Repository<PartnerEligibilitySubmission>, engine: PartnerEligibilityEngine, leadsService: LeadsService);
    submit(dto: PartnerEligibilityDto): Promise<PartnerEligibilityResponse>;
    findAll(page: number, limit: number): Promise<{
        data: PartnerEligibilitySubmission[];
        total: number;
        page: number;
        limit: number;
    }>;
}
