import { AdminRepository } from './admin.repository';
export declare class AdminService {
    private readonly adminRepository;
    constructor(adminRepository: AdminRepository);
    getDashboardSummary(userId: string): Promise<any>;
    getActivityLog(page: number, limit: number): Promise<import("../common/repositories/base.repository").PaginatedResult<import("./entities/activity-log.entity").ActivityLog>>;
}
