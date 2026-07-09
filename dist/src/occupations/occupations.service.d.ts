import { DataSource, Repository } from 'typeorm';
import { Occupation, OccupationThreshold } from './entities/occupation.entity';
import { Visa } from './entities/visa.entity';
import { OccupationVisa } from './entities/occupation-visa.entity';
import { UpdateOccupationDto, CreateOccupationDto } from './dto/occupation.dto';
import { SyncVisasDto } from './dto/sync-visas.dto';
export interface EligibleVisa {
    id: string;
    subclassNumber: string;
    streamTitle: string;
    residencyType: string;
    name: string | null;
    caveats: OccupationVisa['caveats'];
}
export interface OccupationWithVisas extends Occupation {
    eligibleVisas: EligibleVisa[];
}
export interface SyncVisasResult {
    occupationsProcessed: number;
    linksCreated: number;
    linksReactivated: number;
    linksDeactivated: number;
    skippedUnclassified: number;
}
export declare class OccupationsService {
    private readonly occupationRepository;
    private readonly thresholdRepository;
    private readonly visaRepository;
    private readonly occupationVisaRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(occupationRepository: Repository<Occupation>, thresholdRepository: Repository<OccupationThreshold>, visaRepository: Repository<Visa>, occupationVisaRepository: Repository<OccupationVisa>, dataSource: DataSource);
    findAll(filters: Record<string, any>): Promise<Occupation[]>;
    searchOccupations(query: Record<string, any>): Promise<{
        data: Occupation[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(anzscoCode: string): Promise<OccupationWithVisas>;
    getEligibleVisas(anzscoCode: string): Promise<EligibleVisa[]>;
    create(dto: CreateOccupationDto): Promise<OccupationWithVisas>;
    update(anzscoCode: string, dto: UpdateOccupationDto): Promise<OccupationWithVisas>;
    remove(anzscoCode: string): Promise<{
        success: boolean;
    }>;
    getThresholds(): Promise<OccupationThreshold[]>;
    getCanonicalNameMap(anzscoCodes?: string[]): Promise<Record<string, string>>;
    syncVisas(dto?: SyncVisasDto): Promise<SyncVisasResult>;
    private resolveVisasForOccupation;
}
