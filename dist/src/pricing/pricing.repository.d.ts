import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { ServicePackage, UserQuote } from './entities/pricing.entity';
export declare class PricingRepository extends BaseRepository<ServicePackage> {
    private readonly servicePackageRepository;
    constructor(servicePackageRepository: Repository<ServicePackage>);
    findAllActive(): Promise<ServicePackage[]>;
}
export declare class QuotesRepository extends BaseRepository<UserQuote> {
    private readonly userQuoteRepository;
    constructor(userQuoteRepository: Repository<UserQuote>);
    findByUserId(userId: string): Promise<UserQuote[]>;
}
