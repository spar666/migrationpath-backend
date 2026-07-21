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
export declare class OccupationListImportService {
    private readonly occRepo;
    private readonly occupationsService;
    constructor(occRepo: Repository<Occupation>, occupationsService: OccupationsService);
    importLists(dto: ImportOccupationListsDto): Promise<ImportListsResult>;
}
