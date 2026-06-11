import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { ServicePackage, UserQuote } from './entities/pricing.entity';

@Injectable()
export class PricingRepository extends BaseRepository<ServicePackage> {
  constructor(
    @InjectRepository(ServicePackage)
    private readonly servicePackageRepository: Repository<ServicePackage>,
  ) {
    super(servicePackageRepository);
  }

  async findAllActive(): Promise<ServicePackage[]> {
    return this.findAll({ is_active: true });
  }
}

@Injectable()
export class QuotesRepository extends BaseRepository<UserQuote> {
  constructor(
    @InjectRepository(UserQuote)
    private readonly userQuoteRepository: Repository<UserQuote>,
  ) {
    super(userQuoteRepository);
  }

  async findByUserId(userId: string): Promise<UserQuote[]> {
    return this.findAll({ user_id: userId });
  }
}
