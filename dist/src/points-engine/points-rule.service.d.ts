import { PointsRuleRepository } from './points-rule.repository';
import { CreatePointsRuleDto, UpdatePointsRuleDto } from './dto/points-rule.dto';
import { PointsRule } from './entities/points-rule.entity';
export declare class PointsRuleService {
    private readonly pointsRuleRepo;
    constructor(pointsRuleRepo: PointsRuleRepository);
    create(dto: CreatePointsRuleDto): Promise<PointsRule>;
    findAll(): Promise<PointsRule[]>;
    findOne(id: string): Promise<PointsRule>;
    update(id: string, dto: UpdatePointsRuleDto): Promise<PointsRule>;
    remove(id: string): Promise<void>;
    findByCategory(category: string, visa_group?: string): Promise<PointsRule[]>;
    findActive(visa_group?: string): Promise<PointsRule[]>;
    toggleActive(id: string): Promise<PointsRule>;
}
