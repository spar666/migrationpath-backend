import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Occupation } from './entities/occupation.entity';
import { OccupationsService } from './occupations.service';
import { ImportOccupationListsDto } from './dto/import-occupation-lists.dto';

export interface ImportListsResult {
  updated: number;
  updatedCodes: string[];
  notFound: string[];
  visasResynced: boolean;
}

/**
 * Bulk-applies skilled-list membership (MLTSSL/STSOL/ROL/CSOL) to occupations by
 * ANZSCO code — the way the lists actually change (a periodic instrument update),
 * rather than editing occupations one by one. After updating primary_list it can
 * re-resolve the occupation_visas junction from the matrix in one pass.
 */
@Injectable()
export class OccupationListImportService {
  constructor(
    @InjectRepository(Occupation)
    private readonly occRepo: Repository<Occupation>,
    private readonly occupationsService: OccupationsService,
  ) {}

  async importLists(dto: ImportOccupationListsDto): Promise<ImportListsResult> {
    const updatedCodes: string[] = [];
    const notFound: string[] = [];

    for (const row of dto.rows) {
      const occ = await this.occRepo.findOne({
        where: { anzsco_code: row.anzscoCode },
      });
      if (!occ) {
        notFound.push(row.anzscoCode);
        continue;
      }
      occ.primary_list = row.primaryList;
      await this.occRepo.save(occ);
      updatedCodes.push(row.anzscoCode);
    }

    let visasResynced = false;
    if (dto.resyncVisas !== false && updatedCodes.length > 0) {
      await this.occupationsService.syncVisas({ anzscoCodes: updatedCodes });
      visasResynced = true;
    }

    return {
      updated: updatedCodes.length,
      updatedCodes,
      notFound,
      visasResynced,
    };
  }
}
