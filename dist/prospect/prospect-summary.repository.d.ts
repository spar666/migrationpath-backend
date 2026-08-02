import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { ProspectSummary } from './entities/prospect-summary.entity';
export declare class ProspectSummaryRepository extends BaseRepository<ProspectSummary> {
    private readonly summaryRepository;
    constructor(summaryRepository: Repository<ProspectSummary>);
    findByProspectId(prospectId: string): Promise<ProspectSummary | null>;
    upsert(prospectId: string, patch: Partial<ProspectSummary>): Promise<ProspectSummary>;
}
