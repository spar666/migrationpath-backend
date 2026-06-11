import { Injectable } from '@nestjs/common';
import { PointsConfigRepository } from './points-config.repository';
import { UpdatePointsConfigDto } from './dto/update-points-config.dto';
import { PointsConfig } from './entities/points-config.entity';

@Injectable()
export class PointsEngineService {
  constructor(private readonly configRepo: PointsConfigRepository) {}

  async findAllConfig(): Promise<PointsConfig[]> {
    return this.configRepo.findAllActive();
  }

  async updateConfig(
    id: string,
    dto: UpdatePointsConfigDto,
  ): Promise<PointsConfig> {
    return this.configRepo.update(id, dto);
  }
}
