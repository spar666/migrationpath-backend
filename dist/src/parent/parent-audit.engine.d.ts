import { Repository } from 'typeorm';
import { ParentAudit } from './entities/parent-audit.entity';
import { ParentProfileDto } from './dto/parent-profile.dto';
import { ParentAuditResultDto } from './dto/parent-audit-result.dto';
import { PolicyConfigService } from '../policy-config/policy-config.service';
export declare class ParentAuditEngine {
    private readonly auditRepository;
    private readonly policyConfig;
    constructor(auditRepository: Repository<ParentAudit>, policyConfig: PolicyConfigService);
    calculateParentEligibility(profile: ParentProfileDto): Promise<ParentAuditResultDto>;
    private evaluateSponsor;
    private evaluateBalanceOfFamily;
    private balancePasses;
    private evaluateAos;
    private resolveVisaPath;
}
