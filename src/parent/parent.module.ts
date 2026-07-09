import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentController } from './parent.controller';
import { ParentAuditEngine } from './parent-audit.engine';
import { ParentAudit } from './entities/parent-audit.entity';
import { PolicyConfigModule } from '../policy-config/policy-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParentAudit]), PolicyConfigModule],
  controllers: [ParentController],
  providers: [ParentAuditEngine],
  exports: [ParentAuditEngine],
})
export class ParentModule {}
