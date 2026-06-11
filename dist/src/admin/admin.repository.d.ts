import { Repository } from 'typeorm';
import { BaseRepository, PaginatedResult } from '../common/repositories/base.repository';
import { ActivityLog } from './entities/activity-log.entity';
export declare class AdminRepository extends BaseRepository<ActivityLog> {
    private readonly activityLogRepository;
    constructor(activityLogRepository: Repository<ActivityLog>);
    getSummary(userId: string): Promise<any>;
    getActivityLogsWithProfiles(page: number, limit: number): Promise<PaginatedResult<ActivityLog>>;
}
