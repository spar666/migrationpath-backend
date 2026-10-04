import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Occupation } from './entities/occupation.entity';
import { OccupationListMembership } from './entities/occupation-list-membership.entity';
import { OccupationsService } from './occupations.service';
import { ImportOccupationListsDto } from './dto/import-occupation-lists.dto';
export interface ImportListsResult { updated: number; updatedCodes: string[]; notFound: string[]; visasResynced: boolean; }
@Injectable()
export class OccupationListImportService {
  constructor(private readonly dataSource: DataSource, private readonly occupationsService: OccupationsService) {}
  async importLists(dto: ImportOccupationListsDto): Promise<ImportListsResult> {
    if (dto.effectiveDate > new Date().toISOString().slice(0,10)) throw new BadRequestException('Future datasets cannot replace current memberships.');
    const updatedCodes = [...new Set(dto.rows.map(row => row.anzscoCode))];
    await this.dataSource.transaction(async manager => {
      for (const row of dto.rows) {
        await manager.getRepository(Occupation).upsert({ anzsco_code: row.anzscoCode, occupation_name: row.title }, ['anzsco_code']);
        // Additive imports preserve membership in other official instruments.
        await manager.getRepository(OccupationListMembership).upsert(row.lists.map(list_code => ({
          occupation_code: row.anzscoCode, list_code, source_note: dto.sourceNote, effective_date: dto.effectiveDate,
        })), ['occupation_code', 'list_code']);
      }
    });
    const visasResynced = dto.resyncVisas !== false && updatedCodes.length > 0;
    if (visasResynced) await this.occupationsService.syncVisas({ anzscoCodes: updatedCodes });
    return { updated: updatedCodes.length, updatedCodes, notFound: [], visasResynced };
  }
}
