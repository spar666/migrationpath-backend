import { PricingService } from './pricing.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
export declare class PricingController {
    private readonly pricingService;
    constructor(pricingService: PricingService);
    getPackages(): Promise<import("./entities/pricing.entity").ServicePackage[]>;
    createPackage(dto: CreatePackageDto): Promise<import("./entities/pricing.entity").ServicePackage>;
    updatePackage(id: string, dto: UpdatePackageDto): Promise<import("./entities/pricing.entity").ServicePackage>;
    deletePackage(id: string): Promise<void>;
    createQuote(user: AuthUser, createQuoteDto: CreateQuoteDto): Promise<import("./entities/pricing.entity").UserQuote>;
    getMyQuotes(user: AuthUser): Promise<import("./entities/pricing.entity").UserQuote[]>;
}
