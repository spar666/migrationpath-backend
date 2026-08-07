import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { PointsRule } from './entities/points-rule.entity';
export declare class PointsRuleRepository extends BaseRepository<PointsRule> {
    private readonly repo;
    constructor(repo: Repository<PointsRule>);
    findActiveByCategory(category: string, visa_group?: string): Promise<PointsRule[]>;
    findActive(visa_group?: string): Promise<PointsRule[]>;
}
