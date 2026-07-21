import { MigrationRuleService } from './migration-rule.service';
import { CreateMigrationRuleDto } from './dto/create-migration-rule.dto';
import { UpdateMigrationRuleDto } from './dto/update-migration-rule.dto';
export declare class MigrationRuleController {
    private readonly service;
    constructor(service: MigrationRuleService);
    findAll(persona_type?: string): Promise<import("./entities/migration-rule.entity").MigrationRule[]>;
    findOne(id: string): Promise<import("./entities/migration-rule.entity").MigrationRule>;
    create(dto: CreateMigrationRuleDto): Promise<import("./entities/migration-rule.entity").MigrationRule>;
    update(id: string, dto: UpdateMigrationRuleDto): Promise<import("./entities/migration-rule.entity").MigrationRule>;
    remove(id: string): Promise<void>;
}
