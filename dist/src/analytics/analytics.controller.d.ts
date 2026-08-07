import { AnalyticsService } from './analytics.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getTrends(query: PaginationQueryDto): Promise<any>;
    getNominations(): Promise<import("./entities/analytics.entity").StateNomination[]>;
}
