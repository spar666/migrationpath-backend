import { PartnerAuditEngine } from './partner-audit.engine';
import { PartnerProfileDto } from './dto/partner-profile.dto';
import { PartnerAuditResultDto } from './dto/partner-audit-result.dto';
import { PartnerEligibilityService } from './partner-eligibility.service';
import { PartnerEligibilityDto } from './dto/partner-eligibility.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class PartnerController {
    private readonly partnerAuditEngine;
    private readonly eligibilityService;
    constructor(partnerAuditEngine: PartnerAuditEngine, eligibilityService: PartnerEligibilityService);
    audit(profile: PartnerProfileDto): Promise<PartnerAuditResultDto>;
    submitEligibility(dto: PartnerEligibilityDto): Promise<import("./partner-eligibility.service").PartnerEligibilityResponse>;
    listEligibility(query: PaginationQueryDto): Promise<{
        data: import("./entities/partner-eligibility-submission.entity").PartnerEligibilitySubmission[];
        total: number;
        page: number;
        limit: number;
    }>;
}
