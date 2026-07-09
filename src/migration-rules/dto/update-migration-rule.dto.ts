import { PartialType } from '@nestjs/swagger';
import { CreateMigrationRuleDto } from './create-migration-rule.dto';

export class UpdateMigrationRuleDto extends PartialType(CreateMigrationRuleDto) {}
