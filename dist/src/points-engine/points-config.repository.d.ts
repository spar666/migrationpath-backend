import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { PointsConfig } from './entities/points-config.entity';
export declare class PointsConfigRepository extends BaseRepository<PointsConfig> {
    private readonly pointsConfigRepository;
    constructor(pointsConfigRepository: Repository<PointsConfig>);
    findAllActive(): Promise<PointsConfig[]>;
}
