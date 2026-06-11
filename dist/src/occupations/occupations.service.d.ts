import { Repository } from 'typeorm';
import { Occupation, OccupationThreshold } from './entities/occupation.entity';
import { UpdateOccupationDto, CreateOccupationDto } from './dto/occupation.dto';
export declare class OccupationsService {
    private readonly occupationRepository;
    private readonly thresholdRepository;
    constructor(occupationRepository: Repository<Occupation>, thresholdRepository: Repository<OccupationThreshold>);
    findAll(filters: any): Promise<Occupation[]>;
    searchOccupations(query: any): Promise<{
        data: Occupation[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(anzscoCode: string): Promise<Occupation>;
    create(dto: CreateOccupationDto): Promise<Occupation[]>;
    update(id: string, dto: UpdateOccupationDto): Promise<Occupation | null>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getThresholds(): Promise<OccupationThreshold[]>;
}
