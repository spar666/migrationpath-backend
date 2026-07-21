import { OccupationsService } from './occupations.service';
import { CreateOccupationDto, UpdateOccupationDto } from './dto/occupation.dto';
export declare class OccupationsController {
    private readonly occupationsService;
    constructor(occupationsService: OccupationsService);
    search(query: Record<string, unknown>): Promise<{
        data: import("./entities/occupation.entity").Occupation[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAll(filters: Record<string, unknown>): Promise<import("./entities/occupation.entity").Occupation[]>;
    getThresholds(): Promise<import("./entities/occupation.entity").OccupationThreshold[]>;
    findOne(anzsco: string): Promise<import("./occupations.service").OccupationWithVisas>;
    create(createOccupationDto: CreateOccupationDto): Promise<import("./occupations.service").OccupationWithVisas>;
    update(anzsco: string, updateOccupationDto: UpdateOccupationDto): Promise<import("./occupations.service").OccupationWithVisas>;
    remove(anzsco: string): Promise<{
        success: boolean;
    }>;
}
