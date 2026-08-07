import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerController } from './partner.controller';
import { PartnerAuditEngine } from './partner-audit.engine';
import { PartnerAudit } from './entities/partner-audit.entity';
import { PartnerEligibilitySubmission } from './entities/partner-eligibility-submission.entity';
import { PartnerEligibilityEngine } from './partner-eligibility.engine';
import { PartnerEligibilityService } from './partner-eligibility.service';
import { PolicyConfigModule } from '../policy-config/policy-config.module';
import { LeadsModule } from '../leads/leads.module';
import { ProspectModule } from '../prospect/prospect.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PartnerAudit, PartnerEligibilitySubmission]),
    PolicyConfigModule,
    LeadsModule,
    // The partner quiz writes onto the funnel spine (prospect -> booking ->
    // payment). One-way, same as pre-screen: prospect never imports partner.
    ProspectModule,
  ],
  controllers: [PartnerController],
  providers: [
    PartnerAuditEngine,
    PartnerEligibilityEngine,
    PartnerEligibilityService,
  ],
  exports: [PartnerAuditEngine],
})
export class PartnerModule {}
