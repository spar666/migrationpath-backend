import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { PointsConfig } from './entities/points-config.entity';

@Injectable()
export class PointsConfigRepository extends BaseRepository<PointsConfig> {
  constructor(
    @InjectRepository(PointsConfig)
    private readonly pointsConfigRepository: Repository<PointsConfig>,
  ) {
    super(pointsConfigRepository);
  }

  async findAllActive(): Promise<PointsConfig[]> {
    return this.findAll({ is_active: true });
  }
}
