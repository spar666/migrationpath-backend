import { Injectable, NotFoundException } from '@nestjs/common';
import { PointsRuleRepository } from './points-rule.repository';
import {
  CreatePointsRuleDto,
  UpdatePointsRuleDto,
} from './dto/points-rule.dto';
import { PointsRule } from './entities/points-rule.entity';

@Injectable()
export class PointsRuleService {
  constructor(private readonly pointsRuleRepo: PointsRuleRepository) {}

  async create(dto: CreatePointsRuleDto): Promise<PointsRule> {
    return this.pointsRuleRepo.create(dto);
  }

  async findAll(): Promise<PointsRule[]> {
    return this.pointsRuleRepo.findAll();
  }

  async findOne(id: string): Promise<PointsRule> {
    const rule = await this.pointsRuleRepo.findById(id);
    if (!rule) {
      throw new NotFoundException(`Points rule with ID ${id} not found`);
    }
    return rule;
  }

  async update(id: string, dto: UpdatePointsRuleDto): Promise<PointsRule> {
    await this.findOne(id);
    return this.pointsRuleRepo.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.pointsRuleRepo.delete(id);
  }

  async findByCategory(
    category: string,
    visa_group?: string,
  ): Promise<PointsRule[]> {
    return this.pointsRuleRepo.findActiveByCategory(category, visa_group);
  }

  async findActive(visa_group?: string): Promise<PointsRule[]> {
    return this.pointsRuleRepo.findActive(visa_group);
  }

  async toggleActive(id: string): Promise<PointsRule> {
    const rule = await this.findOne(id);
    return this.pointsRuleRepo.update(id, {
      is_active: !rule.is_active,
    });
  }
}
