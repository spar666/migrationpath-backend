import { PointsEngineService } from './points-engine.service';
import { PointsCalculatorService } from './points-calculator/points-calculator.service';
import { PointsInputDto, BusinessPointsInputDto } from './dto/points.dto';
import { SavePointsDto, CompareScenariosDto } from './dto/save-points.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { PointsRuleService } from './points-rule.service';
import { UserPointsService } from './user-points.service';
export declare class PointsEngineController {
    private readonly pointsEngineService;
    private readonly calculator;
    private readonly pointsRuleService;
    private readonly userPointsService;
    constructor(pointsEngineService: PointsEngineService, calculator: PointsCalculatorService, pointsRuleService: PointsRuleService, userPointsService: UserPointsService);
    calculate(input: PointsInputDto): Promise<import("./dto/points.dto").PointsResultDto>;
    calculateBusiness(input: BusinessPointsInputDto): Promise<import("./dto/points.dto").PointsResultDto>;
    getRules(visa_group?: string): Promise<import("./entities/points-rule.entity").PointsRule[]>;
    getConfig(): Promise<import("./entities/points-config.entity").PointsConfig[]>;
    updateConfig(id: string, dto: any): Promise<import("./entities/points-config.entity").PointsConfig>;
    savePoints(user: AuthUser, dto: SavePointsDto): Promise<import("./entities/user-points.entity").UserPoints>;
    getMyPoints(user: AuthUser): Promise<import("./entities/user-points.entity").UserPoints | null>;
    getPointsHistory(user: AuthUser, limit?: number): Promise<{
        timestamp: string;
        totalPoints: number;
        breakdown: Record<string, any>;
    }[]>;
    compareScenarios(user: AuthUser, dto: CompareScenariosDto): Promise<{
        scenario: Record<string, any>;
        points: number;
    }[]>;
    getOccupationPoints(anzsco: string): Promise<{
        occupation: string;
        basePoints: number;
        modifiers: Record<string, number>;
    }>;
    getEligibilityRanges(): Promise<{
        visaType: string;
        minimumPoints: number;
        averagePoints: number;
        percentilePoints: Record<string, number>;
    }[]>;
}
