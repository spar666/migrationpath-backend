import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerController } from './partner.controller';
import { PartnerAuditEngine } from './partner-audit.engine';
import { PartnerAudit } from './entities/partner-audit.entity';
import { PolicyConfigModule } from '../policy-config/policy-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerAudit]), PolicyConfigModule],
  controllers: [PartnerController],
  providers: [PartnerAuditEngine],
  exports: [PartnerAuditEngine],
})
export class PartnerModule {}
