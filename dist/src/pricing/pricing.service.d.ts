import { PricingRepository, QuotesRepository } from './pricing.repository';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { ServicePackage, UserQuote } from './entities/pricing.entity';
export declare class PricingService {
    private readonly pricingRepo;
    private readonly quotesRepo;
    constructor(pricingRepo: PricingRepository, quotesRepo: QuotesRepository);
    getActivePackages(): Promise<ServicePackage[]>;
    createPackage(dto: CreatePackageDto): Promise<ServicePackage>;
    updatePackage(id: string, dto: UpdatePackageDto): Promise<ServicePackage>;
    deletePackage(id: string): Promise<void>;
    createQuote(userId: string, dto: CreateQuoteDto): Promise<UserQuote>;
    getMyQuotes(userId: string): Promise<UserQuote[]>;
}
