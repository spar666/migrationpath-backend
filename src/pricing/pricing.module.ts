import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PricingRepository, QuotesRepository } from './pricing.repository';
import { ServicePackage, UserQuote } from './entities/pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServicePackage, UserQuote])],
  controllers: [PricingController],
  providers: [PricingService, PricingRepository, QuotesRepository],
  exports: [PricingService, PricingRepository, QuotesRepository],
})
export class PricingModule {}
