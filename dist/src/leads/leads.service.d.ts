import { LeadsRepository } from './leads.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { Lead } from './entities/lead.entity';
import { PaginatedResult } from '../common/repositories/base.repository';
import { LeadNotifierService } from './lead-notifier.service';
export declare class LeadsService {
    private readonly leadsRepo;
    private readonly leadNotifier;
    private readonly logger;
    constructor(leadsRepo: LeadsRepository, leadNotifier: LeadNotifierService);
    create(dto: CreateLeadDto): Promise<Lead>;
    findAll(page: number, limit: number): Promise<PaginatedResult<Lead>>;
    updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<Lead>;
}
