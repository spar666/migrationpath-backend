import { Injectable } from '@nestjs/common';
import { PointsRuleRepository } from './points-rule.repository';
import {
  CreatePointsConfigDto,
  UpdatePointsConfigDto,
} from './dto/update-points-config.dto';
import { PointsRule } from './entities/points-rule.entity';

/**
 * Admin CRUD over the points configuration.
 *
 * This used to read and write `points_config`, a table nothing else touched.
 * The calculator has always resolved its values from `points_rules` (see
 * PointsAggregatorService), so an admin editing "Points Configuration" changed
 * a row no calculation ever read — the screen and the calculator were wired to
 * two different tables. That is the contradiction: the values were never
 * hardcoded, they were simply being edited in the wrong place.
 *
 * These methods now operate on `points_rules`, making it the single source of
 * truth. The route paths are unchanged so the admin screen keeps working.
 *
 * `points_rules` is also the richer shape: it carries `min_value`/`max_value`,
 * which range categories (AGE, and both work-experience ladders) require and
 * `points_config` never had — so the move only had one possible direction.
 */
@Injectable()
export class PointsEngineService {
  constructor(private readonly ruleRepo: PointsRuleRepository) {}

  async findAllConfig(): Promise<PointsRule[]> {
    return this.ruleRepo.findAll({ is_active: true });
  }

  async createConfig(dto: CreatePointsConfigDto): Promise<PointsRule> {
    return this.ruleRepo.create({
      visa_group: dto.visa_group ?? 'GSM',
      category: dto.category,
      sub_category: dto.sub_category,
      attribute_label: dto.attribute_label,
      min_value: dto.min_value,
      max_value: dto.max_value,
      points_value: dto.points_value,
      is_active: dto.is_active ?? true,
    } as Partial<PointsRule>);
  }

  async updateConfig(
    id: string,
    dto: UpdatePointsConfigDto,
  ): Promise<PointsRule> {
    return this.ruleRepo.update(id, dto as Partial<PointsRule>);
  }

  async removeConfig(id: string): Promise<{ success: boolean }> {
    await this.ruleRepo.delete(id);
    return { success: true };
  }
}
