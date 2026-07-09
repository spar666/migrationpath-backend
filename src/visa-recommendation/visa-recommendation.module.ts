import { Module } from '@nestjs/common';
import { VisaRecommendationService } from './visa-recommendation.service';
import { VisaRecommendationController } from './visa-recommendation.controller';
import { OccupationsModule } from '../occupations/occupations.module';
import { PolicyConfigModule } from '../policy-config/policy-config.module';

@Module({
  imports: [OccupationsModule, PolicyConfigModule],
  controllers: [VisaRecommendationController],
  providers: [VisaRecommendationService],
  exports: [VisaRecommendationService],
})
export class VisaRecommendationModule {}
