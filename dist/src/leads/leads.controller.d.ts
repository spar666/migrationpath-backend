import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(dto: CreateLeadDto): Promise<import("./entities/lead.entity").Lead>;
    findAll(query: PaginationQueryDto): Promise<import("../common/repositories/base.repository").PaginatedResult<import("./entities/lead.entity").Lead>>;
    updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<import("./entities/lead.entity").Lead>;
}
