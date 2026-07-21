import { AdminService } from './admin.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getSummary(user: AuthUser): Promise<any>;
    getActivityLog(query: PaginationQueryDto): Promise<import("../common/repositories/base.repository").PaginatedResult<import("./entities/activity-log.entity").ActivityLog>>;
}
