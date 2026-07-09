import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { MigrationRule } from './entities/migration-rule.entity';

@Injectable()
export class MigrationRuleRepository extends BaseRepository<MigrationRule> {
  constructor(
    @InjectRepository(MigrationRule)
    private readonly repo: Repository<MigrationRule>,
  ) {
    super(repo);
  }

  async findByPersonaType(persona_type: string): Promise<MigrationRule[]> {
    return this.findAll({ persona_type } as any);
  }
}
