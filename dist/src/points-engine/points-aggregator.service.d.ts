import { PointsRuleRepository } from './points-rule.repository';
import { UserProfileDto, StructuredPointsResultDto } from './dto/user-profile.dto';
import { PolicyConfigService } from '../policy-config/policy-config.service';
export declare class PointsAggregatorService {
    private readonly ruleRepo;
    private readonly policyConfig;
    constructor(ruleRepo: PointsRuleRepository, policyConfig: PolicyConfigService);
    calculateTotalPoints(profile: UserProfileDto): Promise<StructuredPointsResultDto>;
}
