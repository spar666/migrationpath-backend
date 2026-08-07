import { MigrationRuleRepository } from './migration-rule.repository';
import { CreateMigrationRuleDto } from './dto/create-migration-rule.dto';
import { UpdateMigrationRuleDto } from './dto/update-migration-rule.dto';
import { MigrationRule } from './entities/migration-rule.entity';
export declare class MigrationRuleService {
    private readonly repo;
    constructor(repo: MigrationRuleRepository);
    create(dto: CreateMigrationRuleDto): Promise<MigrationRule>;
    findAll(): Promise<MigrationRule[]>;
    findOne(id: string): Promise<MigrationRule>;
    update(id: string, dto: UpdateMigrationRuleDto): Promise<MigrationRule>;
    remove(id: string): Promise<void>;
    findByPersonaType(persona_type: string): Promise<MigrationRule[]>;
}
