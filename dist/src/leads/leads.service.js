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
var LeadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const leads_repository_1 = require("./leads.repository");
const lead_notifier_service_1 = require("./lead-notifier.service");
let LeadsService = LeadsService_1 = class LeadsService {
    leadsRepo;
    leadNotifier;
    logger = new common_1.Logger(LeadsService_1.name);
    constructor(leadsRepo, leadNotifier) {
        this.leadsRepo = leadsRepo;
        this.leadNotifier = leadNotifier;
    }
    async create(dto) {
        if (dto.website) {
            this.logger.warn(`Honeypot triggered on lead submission from "${dto.email || 'unknown'}" — discarding silently.`);
            return {
                id: 'discarded',
                full_name: dto.full_name,
                email: dto.email,
                phone: dto.phone,
                visa_type: dto.visa_type,
                message: dto.message,
                package_id: dto.package_id,
                source: dto.source ?? 'other',
                status: 'new',
                created_at: new Date(),
                updated_at: new Date(),
            };
        }
        const lead = await this.leadsRepo.create({
            full_name: dto.full_name,
            email: dto.email,
            phone: dto.phone,
            visa_type: dto.visa_type,
            message: dto.message,
            package_id: dto.package_id,
            source: dto.source ?? 'other',
        });
        this.leadNotifier.notifyNewLead(lead).catch((error) => {
            this.logger.error(`Unexpected error notifying about new lead: ${error.message}`);
        });
        return lead;
    }
    async findAll(page, limit) {
        return this.leadsRepo.paginate(page, limit);
    }
    async updateStatus(id, dto) {
        return this.leadsRepo.update(id, { status: dto.status });
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = LeadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leads_repository_1.LeadsRepository,
        lead_notifier_service_1.LeadNotifierService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map