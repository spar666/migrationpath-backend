import { VisaRecommendationService } from './visa-recommendation.service';
import { VisaRecommendationDto } from './dto/visa-recommendation.dto';
export declare class VisaRecommendationController {
    private readonly visaRecommendationService;
    constructor(visaRecommendationService: VisaRecommendationService);
    recommend(dto: VisaRecommendationDto): Promise<import("./visa-recommendation.service").VisaRecommendation[]>;
    findAllSubclasses(): {
        id: string;
        name: string;
    }[];
}
