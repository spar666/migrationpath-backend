import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getStats(): Promise<{
        courses: number;
        occupations: number;
        universities: number;
    }>;
}
