import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { InvitationTrend, StateNomination } from './entities/analytics.entity';
export declare class TrendsRepository extends BaseRepository<InvitationTrend> {
    private readonly trendRepository;
    constructor(trendRepository: Repository<InvitationTrend>);
    findByOccupation(anzscoCode: string): Promise<InvitationTrend[]>;
}
export declare class StateNominationsRepository extends BaseRepository<StateNomination> {
    private readonly stateNominationRepository;
    constructor(stateNominationRepository: Repository<StateNomination>);
    findByState(stateCode: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT'): Promise<StateNomination[]>;
}
