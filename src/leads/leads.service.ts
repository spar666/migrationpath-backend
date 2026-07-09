import { Injectable, Logger } from '@nestjs/common';
import { LeadsRepository } from './leads.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { Lead } from './entities/lead.entity';
import { PaginatedResult } from '../common/repositories/base.repository';
import { LeadNotifierService } from './lead-notifier.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly leadsRepo: LeadsRepository,
    private readonly leadNotifier: LeadNotifierService,
  ) {}

  async create(dto: CreateLeadDto): Promise<Lead> {
    if (dto.website) {
      // Honeypot tripped — a real visitor never sees or fills this field,
      // so anything here is almost certainly a bot. Return a lead-shaped
      // object without persisting or notifying anyone, so the submitter
      // (bot or otherwise) sees the same success response a real
      // submission would get and has no signal to adapt against.
      this.logger.warn(
        `Honeypot triggered on lead submission from "${dto.email || 'unknown'}" — discarding silently.`,
      );
      return {
        id: 'discarded',
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        visa_type: dto.visa_type,
        message: dto.message,
        package_id: dto.package_id,
        source: dto.source ?? 'other',
        status: 'new',
        created_at: new Date(),
        updated_at: new Date(),
      } as Lead;
    }

    const lead = await this.leadsRepo.create({
      full_name: dto.full_name,
      email: dto.email,
      phone: dto.phone,
      visa_type: dto.visa_type,
      message: dto.message,
      package_id: dto.package_id,
      source: dto.source ?? 'other',
    });

    // Notifications must never affect the caller's success response —
    // a misconfigured mail server or a Slack outage should not make lead
    // capture itself fail.
    this.leadNotifier.notifyNewLead(lead).catch((error) => {
      this.logger.error(`Unexpected error notifying about new lead: ${error.message}`);
    });

    return lead;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<Lead>> {
    return this.leadsRepo.paginate(page, limit);
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<Lead> {
    return this.leadsRepo.update(id, { status: dto.status });
  }
}
