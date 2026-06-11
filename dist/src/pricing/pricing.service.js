"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const pricing_repository_1 = require("./pricing.repository");
let PricingService = class PricingService {
    pricingRepo;
    quotesRepo;
    constructor(pricingRepo, quotesRepo) {
        this.pricingRepo = pricingRepo;
        this.quotesRepo = quotesRepo;
    }
    async getActivePackages() {
        return this.pricingRepo.findAllActive();
    }
    async createPackage(dto) {
        return this.pricingRepo.create(dto);
    }
    async updatePackage(id, dto) {
        return this.pricingRepo.update(id, dto);
    }
    async deletePackage(id) {
        return this.pricingRepo.hardDelete(id);
    }
    async createQuote(userId, dto) {
        const pkg = await this.pricingRepo.findById(dto.package_id);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        return this.quotesRepo.create({
            user_id: userId,
            package_id: dto.package_id,
            status: 'draft',
            total_amount: pkg.professional_fees + pkg.government_charges + pkg.estimated_extras,
            custom_notes: dto.custom_notes,
            expires_at: expiresAt,
        });
    }
    async getMyQuotes(userId) {
        return this.quotesRepo.findByUserId(userId);
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pricing_repository_1.PricingRepository,
        pricing_repository_1.QuotesRepository])
], PricingService);
//# sourceMappingURL=pricing.service.js.map