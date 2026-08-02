import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { ProspectSummary } from './entities/prospect-summary.entity';

@Injectable()
export class ProspectSummaryRepository extends BaseRepository<ProspectSummary> {
  constructor(
    @InjectRepository(ProspectSummary)
    private readonly summaryRepository: Repository<ProspectSummary>,
  ) {
    super(summaryRepository);
  }

  findByProspectId(prospectId: string): Promise<ProspectSummary | null> {
    return this.summaryRepository.findOne({
      where: { prospect_id: prospectId },
    });
  }

  /**
   * Insert-or-merge on prospect_id. Merges rather than overwrites so a
   * partial refresh (e.g. only the payment block after a webhook) does not
   * wipe the engine result written at pre-screen time.
   */
  async upsert(
    prospectId: string,
    patch: Partial<ProspectSummary>,
  ): Promise<ProspectSummary> {
    const existing = await this.findByProspectId(prospectId);
    if (!existing) {
      const created = this.summaryRepository.create({
        prospect_id: prospectId,
        ...patch,
      });
      return this.summaryRepository.save(created);
    }
    Object.assign(existing, patch);
    return this.summaryRepository.save(existing);
  }
}
