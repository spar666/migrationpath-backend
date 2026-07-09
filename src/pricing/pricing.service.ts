import { Injectable } from '@nestjs/common';
import { PricingRepository, QuotesRepository } from './pricing.repository';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { ServicePackage, UserQuote } from './entities/pricing.entity';

@Injectable()
export class PricingService {
  constructor(
    private readonly pricingRepo: PricingRepository,
    private readonly quotesRepo: QuotesRepository,
  ) {}

  // ─── Packages ──────────────────────────────────────────────

  async getActivePackages(): Promise<ServicePackage[]> {
    return this.pricingRepo.findAllActive();
  }

  async createPackage(dto: CreatePackageDto): Promise<ServicePackage> {
    return this.pricingRepo.create(dto);
  }

  async updatePackage(
    id: string,
    dto: UpdatePackageDto,
  ): Promise<ServicePackage> {
    return this.pricingRepo.update(id, dto);
  }

  async deletePackage(id: string): Promise<void> {
    return this.pricingRepo.hardDelete(id);
  }

  // ─── Quotes ────────────────────────────────────────────────

  async createQuote(userId: string, dto: CreateQuoteDto): Promise<UserQuote> {
    const pkg = await this.pricingRepo.findById(dto.package_id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

    return this.quotesRepo.create({
      user_id: userId,
      package_id: dto.package_id,
      status: 'draft',
      total_amount:
        pkg.professional_fees + pkg.government_charges + pkg.estimated_extras,
      custom_notes: dto.custom_notes,
      expires_at: expiresAt,
    });
  }

  async getMyQuotes(userId: string): Promise<UserQuote[]> {
    return this.quotesRepo.findByUserId(userId);
  }
}
