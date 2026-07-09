import { PartnerAuditEngine } from './partner-audit.engine';
import { PartnerProfileDto } from './dto/partner-profile.dto';
import { PartnerAuditResultDto } from './dto/partner-audit-result.dto';
export declare class PartnerController {
    private readonly partnerAuditEngine;
    constructor(partnerAuditEngine: PartnerAuditEngine);
    audit(profile: PartnerProfileDto): Promise<PartnerAuditResultDto>;
}
