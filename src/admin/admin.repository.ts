import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BaseRepository,
  PaginatedResult,
} from '../common/repositories/base.repository';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class AdminRepository extends BaseRepository<ActivityLog> {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {
    super(activityLogRepository);
  }

  /**
   * Get dashboard summary via direct SQL query (replacing RPC).
   */
  async getSummary(userId: string): Promise<any> {
    return this.repository.query('SELECT * FROM get_dashboard_summary($1)', [
      userId,
    ]);
  }

  /**
   * Get activity logs with profile information.
   */
  async getActivityLogsWithProfiles(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ActivityLog>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      relations: ['profile'],
      order: { created_at: 'DESC' } as any,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
