import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { MigrationRule } from './entities/migration-rule.entity';
export declare class MigrationRuleRepository extends BaseRepository<MigrationRule> {
    private readonly repo;
    constructor(repo: Repository<MigrationRule>);
    findByPersonaType(persona_type: string): Promise<MigrationRule[]>;
}
