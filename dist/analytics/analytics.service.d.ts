import { TrendsRepository, StateNominationsRepository } from './analytics.repository';
import { StateNomination } from './entities/analytics.entity';
export declare class AnalyticsService {
    private readonly trendsRepository;
    private readonly stateNominationsRepository;
    constructor(trendsRepository: TrendsRepository, stateNominationsRepository: StateNominationsRepository);
    getInvitationTrends(page: number, limit: number, filters?: any): Promise<any>;
    getStateNominations(): Promise<StateNomination[]>;
}
