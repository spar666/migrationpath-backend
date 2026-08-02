import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prospect } from './entities/prospect.entity';
import { ProspectSummary } from './entities/prospect-summary.entity';
import { ProspectRepository } from './prospect.repository';
import { ProspectSummaryRepository } from './prospect-summary.repository';
import { ProspectService } from './prospect.service';
import { ProspectSummaryService } from './prospect-summary.service';
import { ProspectNotifierService } from './prospect-notifier.service';
import { ProspectController } from './prospect.controller';
import { EmployerSponsoredModule } from '../employer-sponsored/employer-sponsored.module';
import { ConsultationModule } from '../consultation/consultation.module';

/**
 * The funnel spine.
 *
 * Dependency direction is one-way on purpose:
 *   prospect -> employer-sponsored (for the sponsorship block on the summary)
 *   prospect -> consultation       (for the booking block on the summary)
 * and never the reverse. Modules that need a prospect (pre-screen, payments,
 * webhooks) import THIS module. That keeps the graph acyclic without needing
 * forwardRef anywhere.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Prospect, ProspectSummary]),
    EmployerSponsoredModule,
    ConsultationModule,
  ],
  controllers: [ProspectController],
  providers: [
    ProspectRepository,
    ProspectSummaryRepository,
    ProspectService,
    ProspectSummaryService,
    ProspectNotifierService,
  ],
  exports: [
    ProspectRepository,
    ProspectSummaryRepository,
    ProspectService,
    ProspectSummaryService,
    ProspectNotifierService,
  ],
})
export class ProspectModule {}
