import { Injectable } from '@nestjs/common';
import { MigrationRuleRepository } from './migration-rule.repository';
import { CreateMigrationRuleDto } from './dto/create-migration-rule.dto';
import { UpdateMigrationRuleDto } from './dto/update-migration-rule.dto';
import { MigrationRule } from './entities/migration-rule.entity';

@Injectable()
export class MigrationRuleService {
  constructor(private readonly repo: MigrationRuleRepository) {}

  async create(dto: CreateMigrationRuleDto): Promise<MigrationRule> {
    return this.repo.create(dto as any);
  }

  async findAll(): Promise<MigrationRule[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<MigrationRule> {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateMigrationRuleDto): Promise<MigrationRule> {
    return this.repo.update(id, dto as any);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findByPersonaType(persona_type: string): Promise<MigrationRule[]> {
    return this.repo.findByPersonaType(persona_type);
  }
}
