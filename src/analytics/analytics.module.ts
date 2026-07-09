import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import {
  TrendsRepository,
  StateNominationsRepository,
} from './analytics.repository';
import { InvitationTrend, StateNomination } from './entities/analytics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationTrend, StateNomination])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, TrendsRepository, StateNominationsRepository],
  exports: [AnalyticsService, TrendsRepository, StateNominationsRepository],
})
export class AnalyticsModule {}
