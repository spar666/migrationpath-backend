import { Repository } from 'typeorm';
import { DataSourceMeta } from './entities/data-source-meta.entity';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
export type FreshnessStatus = 'current' | 'review' | 'stale';
export interface FreshnessRow {
    domain: string;
    label: string;
    adminRoute: string | null;
    status: FreshnessStatus;
    lastVerifiedAt: Date | null;
    reviewIntervalDays: number;
    daysSinceVerified: number | null;
    sourceUrl: string | null;
    notes: string | null;
}
export declare class DataFreshnessService {
    private readonly repo;
    constructor(repo: Repository<DataSourceMeta>);
    private computeStatus;
    findAll(): Promise<FreshnessRow[]>;
    markVerified(domain: string): Promise<FreshnessRow>;
    update(domain: string, dto: UpdateDataSourceDto): Promise<DataSourceMeta>;
}
