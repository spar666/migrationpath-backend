import { UserPointsRepository } from './user-points.repository';
import { UserPoints } from './entities/user-points.entity';
import { SavePointsDto, CompareScenariosDto } from './dto/save-points.dto';
import { OccupationsService } from '../occupations/occupations.service';
export declare class UserPointsService {
    private readonly repo;
    private readonly occupationsService;
    constructor(repo: UserPointsRepository, occupationsService: OccupationsService);
    save(userId: string, dto: SavePointsDto): Promise<UserPoints>;
    getLatest(userId: string): Promise<UserPoints | null>;
    getHistory(userId: string, limit?: number): Promise<{
        timestamp: string;
        totalPoints: number;
        breakdown: Record<string, any>;
    }[]>;
    compareScenarios(userId: string, dto: CompareScenariosDto): Promise<{
        scenario: Record<string, any>;
        points: number;
    }[]>;
    getOccupationPoints(anzscoCode: string): Promise<{
        anzscoCode: string;
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
