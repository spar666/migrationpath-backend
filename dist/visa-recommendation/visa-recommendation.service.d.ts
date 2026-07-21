import { OccupationsService } from '../occupations/occupations.service';
import { PointsResultDto } from '../points-engine/dto/points.dto';
import { PolicyConfigService } from '../policy-config/policy-config.service';
export interface VisaRecommendation {
    subclass: string;
    name: string;
    eligible: boolean;
    reason?: string;
}
export declare class VisaRecommendationService {
    private readonly occupationsService;
    private readonly policyConfig;
    constructor(occupationsService: OccupationsService, policyConfig: PolicyConfigService);
    recommend(anzscoCode: string, points: PointsResultDto): Promise<VisaRecommendation[]>;
}
