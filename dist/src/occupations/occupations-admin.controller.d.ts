import { OccupationsService } from './occupations.service';
import { OccupationListImportService } from './occupation-list-import.service';
import { SyncVisasDto } from './dto/sync-visas.dto';
import { ImportOccupationListsDto } from './dto/import-occupation-lists.dto';
export declare class OccupationsAdminController {
    private readonly occupationsService;
    private readonly listImportService;
    constructor(occupationsService: OccupationsService, listImportService: OccupationListImportService);
    syncVisas(dto: SyncVisasDto): Promise<import("./occupations.service").SyncVisasResult>;
    importLists(dto: ImportOccupationListsDto): Promise<import("./occupation-list-import.service").ImportListsResult>;
}
