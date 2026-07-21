import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RegionalPostcodeBand } from './entities/regional-postcode-band.entity';
import { CreateRegionalBandDto, UpdateRegionalBandDto, BulkImportRegionalBandsDto } from './dto/regional-postcode.dto';
export interface RegionBand {
    region: string;
    ranges: [number, number][];
}
export interface BandSet {
    metro: RegionBand[];
    cat2: RegionBand[];
    cat3: RegionBand[];
}
export declare class RegionalPostcodeService implements OnModuleInit {
    private readonly repo;
    private readonly logger;
    private cache;
    constructor(repo: Repository<RegionalPostcodeBand>);
    onModuleInit(): Promise<void>;
    getCachedBands(): BandSet;
    private reload;
    findAll(): Promise<RegionalPostcodeBand[]>;
    create(dto: CreateRegionalBandDto): Promise<RegionalPostcodeBand>;
    update(id: string, dto: UpdateRegionalBandDto): Promise<RegionalPostcodeBand>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    bulkImport(dto: BulkImportRegionalBandsDto): Promise<{
        imported: number;
        deactivated: number;
    }>;
}
