import { Repository } from 'typeorm';
import { Occupation } from '../occupations/entities/occupation.entity';
import { PointsResultDto } from '../points-engine/dto/points.dto';
export interface VisaRecommendation {
    subclass: string;
    name: string;
    eligible: boolean;
    reason?: string;
}
export declare class VisaRecommendationService {
    private readonly occupationRepository;
    constructor(occupationRepository: Repository<Occupation>);
    recommend(anzscoCode: string, points: PointsResultDto): Promise<VisaRecommendation[]>;
}
