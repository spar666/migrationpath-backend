import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MigrationRuleController } from './migration-rule.controller';
import { MigrationRuleService } from './migration-rule.service';
import { MigrationRuleRepository } from './migration-rule.repository';
import { MigrationRule } from './entities/migration-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MigrationRule])],
  controllers: [MigrationRuleController],
  providers: [MigrationRuleService, MigrationRuleRepository],
  exports: [MigrationRuleService, MigrationRuleRepository],
})
export class MigrationRuleModule {}
