import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisaRecommendationService } from './visa-recommendation.service';
import { VisaRecommendationController } from './visa-recommendation.controller';
import { Occupation } from '../occupations/entities/occupation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Occupation])],
  controllers: [VisaRecommendationController],
  providers: [VisaRecommendationService],
  exports: [VisaRecommendationService],
})
export class VisaRecommendationModule {}
