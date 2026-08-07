import { PolicyConfigService } from './policy-config.service';
import { UpdatePolicyConfigDto } from './dto/update-policy-config.dto';
export declare class PolicyConfigController {
    private readonly policyConfigService;
    constructor(policyConfigService: PolicyConfigService);
    findAll(): Promise<import("./entities/policy-config.entity").PolicyConfig[]>;
    update(key: string, dto: UpdatePolicyConfigDto): Promise<import("./entities/policy-config.entity").PolicyConfig>;
}
