import { Repository } from 'typeorm';
import { PartnerAudit } from './entities/partner-audit.entity';
import { PartnerProfileDto } from './dto/partner-profile.dto';
import { PartnerAuditResultDto } from './dto/partner-audit-result.dto';
import { PolicyConfigService } from '../policy-config/policy-config.service';
export declare class PartnerAuditEngine {
    private readonly auditRepository;
    private readonly policyConfig;
    constructor(auditRepository: Repository<PartnerAudit>, policyConfig: PolicyConfigService);
    calculatePartnerReadiness(profile: PartnerProfileDto): Promise<PartnerAuditResultDto>;
    private resolveVisaPath;
    private buildRecommendations;
}
