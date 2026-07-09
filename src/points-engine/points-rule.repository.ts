import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { PointsRule } from './entities/points-rule.entity';

@Injectable()
export class PointsRuleRepository extends BaseRepository<PointsRule> {
  constructor(
    @InjectRepository(PointsRule)
    private readonly repo: Repository<PointsRule>,
  ) {
    super(repo);
  }

  async findActiveByCategory(category: string, visa_group = 'GSM') {
    return this.findAll({ category, is_active: true, visa_group });
  }

  async findActive(visa_group?: string) {
    const filters: any = { is_active: true };
    if (visa_group) {
      filters.visa_group = visa_group;
    }
    return this.findAll(filters);
  }
}
