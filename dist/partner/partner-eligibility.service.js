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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PartnerEligibilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerEligibilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const partner_eligibility_submission_entity_1 = require("./entities/partner-eligibility-submission.entity");
const partner_eligibility_engine_1 = require("./partner-eligibility.engine");
const leads_service_1 = require("../leads/leads.service");
let PartnerEligibilityService = PartnerEligibilityService_1 = class PartnerEligibilityService {
    submissions;
    engine;
    leadsService;
    logger = new common_1.Logger(PartnerEligibilityService_1.name);
    constructor(submissions, engine, leadsService) {
        this.submissions = submissions;
        this.engine = engine;
        this.leadsService = leadsService;
    }
    async submit(dto) {
        const result = this.engine.assess(dto);
        const saved = await this.submissions.save(this.submissions.create({
            applicantFirstName: dto.applicantFirstName,
            sponsorFirstName: dto.sponsorFirstName,
            completedBy: dto.completedBy,
            email: dto.email,
            applicantCountry: dto.applicantCountry,
            relationshipStatus: dto.relationshipStatus,
            outcome: result.outcome,
            summary: result.summary,
            effort: result.effort,
            highRisk: result.highRisk,
            becomingEligible: result.becomingEligible,
            answers: dto,
        }));
        this.logger.log(`Partner eligibility submission ${saved.id}: ${result.summary} / ${result.effort}`);
        this.leadsService
            .create({
            full_name: `${dto.applicantFirstName} & ${dto.sponsorFirstName}`,
            email: dto.email,
            visa_type: 'Partner visa (820/801/309/100/300)',
            message: `Partner eligibility quiz — ${result.summary} (${result.effort}). ` +
                `Completed by: ${dto.completedBy}. ` +
                `Applicant country: ${dto.applicantCountry}. ` +
                `Relationship: ${dto.relationshipStatus}. ` +
                `Submission: ${saved.id}`,
            source: 'partner_eligibility',
        })
            .catch((error) => {
            this.logger.error(`Failed to create lead for eligibility submission ${saved.id}: ${error.message}`);
        });
        return {
            id: saved.id,
            applicantFirstName: saved.applicantFirstName,
            sponsorFirstName: saved.sponsorFirstName,
            ...result,
        };
    }
    async findAll(page, limit) {
        const [data, total] = await this.submissions.findAndCount({
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }
};
exports.PartnerEligibilityService = PartnerEligibilityService;
exports.PartnerEligibilityService = PartnerEligibilityService = PartnerEligibilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(partner_eligibility_submission_entity_1.PartnerEligibilitySubmission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        partner_eligibility_engine_1.PartnerEligibilityEngine,
        leads_service_1.LeadsService])
], PartnerEligibilityService);
//# sourceMappingURL=partner-eligibility.service.js.map