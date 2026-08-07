import { PointsInputDto, PointsResultDto, BusinessPointsInputDto } from '../dto/points.dto';
import { PointsConfigRepository } from '../points-config.repository';
import { PointsRuleRepository } from '../points-rule.repository';
export declare class PointsCalculatorService {
    private readonly configRepo;
    private readonly ruleRepo;
    constructor(configRepo: PointsConfigRepository, ruleRepo: PointsRuleRepository);
    calculatePoints(input: PointsInputDto): Promise<PointsResultDto>;
    calculateBusinessPoints(input: BusinessPointsInputDto): Promise<PointsResultDto>;
}
