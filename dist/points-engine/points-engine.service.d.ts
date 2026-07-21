import { PointsConfigRepository } from './points-config.repository';
import { UpdatePointsConfigDto } from './dto/update-points-config.dto';
import { PointsConfig } from './entities/points-config.entity';
export declare class PointsEngineService {
    private readonly configRepo;
    constructor(configRepo: PointsConfigRepository);
    findAllConfig(): Promise<PointsConfig[]>;
    updateConfig(id: string, dto: UpdatePointsConfigDto): Promise<PointsConfig>;
}
