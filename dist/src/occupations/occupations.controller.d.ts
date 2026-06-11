import { OccupationsService } from './occupations.service';
import { CreateOccupationDto, UpdateOccupationDto } from './dto/occupation.dto';
export declare class OccupationsController {
    private readonly occupationsService;
    constructor(occupationsService: OccupationsService);
    search(query: any): Promise<{
        data: import("./entities/occupation.entity").Occupation[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAll(filters: any): Promise<import("./entities/occupation.entity").Occupation[]>;
    getThresholds(): Promise<import("./entities/occupation.entity").OccupationThreshold[]>;
    findOne(anzsco: string): Promise<import("./entities/occupation.entity").Occupation>;
    create(createOccupationDto: CreateOccupationDto): Promise<import("./entities/occupation.entity").Occupation[]>;
    update(id: string, updateOccupationDto: UpdateOccupationDto): Promise<import("./entities/occupation.entity").Occupation | null>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
