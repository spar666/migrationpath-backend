import { Repository } from 'typeorm';
import { PolicyConfig } from './entities/policy-config.entity';
import { UpdatePolicyConfigDto } from './dto/update-policy-config.dto';
export declare class PolicyConfigService {
    private readonly repo;
    private cache;
    constructor(repo: Repository<PolicyConfig>);
    private ensureLoaded;
    snapshot(): Promise<Map<string, number>>;
    getNumber(key: string, fallback: number): Promise<number>;
    static num(snapshot: Map<string, number>, key: string, fallback: number): number;
    findAll(): Promise<PolicyConfig[]>;
    update(configKey: string, dto: UpdatePolicyConfigDto): Promise<PolicyConfig>;
}
