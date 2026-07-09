import { RegionalPostcodeService } from './regional-postcode.service';
import { CreateRegionalBandDto, UpdateRegionalBandDto, BulkImportRegionalBandsDto } from './dto/regional-postcode.dto';
export declare class RegionalPostcodeController {
    private readonly service;
    constructor(service: RegionalPostcodeService);
    findAll(): Promise<import("./entities/regional-postcode-band.entity").RegionalPostcodeBand[]>;
    create(dto: CreateRegionalBandDto): Promise<import("./entities/regional-postcode-band.entity").RegionalPostcodeBand>;
    bulkImport(dto: BulkImportRegionalBandsDto): Promise<{
        imported: number;
        deactivated: number;
    }>;
    update(id: string, dto: UpdateRegionalBandDto): Promise<import("./entities/regional-postcode-band.entity").RegionalPostcodeBand>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
