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
var ProspectService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProspectService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prospect_repository_1 = require("./prospect.repository");
const prospect_summary_service_1 = require("./prospect-summary.service");
const consultation_repository_1 = require("../consultation/consultation.repository");
const REF_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const REF_LENGTH = 6;
const REF_PREFIX = 'MP-';
const REF_MAX_ATTEMPTS = 8;
let ProspectService = ProspectService_1 = class ProspectService {
    prospectRepository;
    summaryService;
    bookingRepository;
    logger = new common_1.Logger(ProspectService_1.name);
    constructor(prospectRepository, summaryService, bookingRepository) {
        this.prospectRepository = prospectRepository;
        this.summaryService = summaryService;
        this.bookingRepository = bookingRepository;
    }
    async capture(dto) {
        if (!dto.consent_given) {
            throw new common_1.BadRequestException('Consent is required before we can record your details.');
        }
        const prospect = await this.create({
            party: dto.party ?? 'applicant',
            full_name: dto.full_name,
            email: dto.email,
            phone: dto.phone,
            company_name: dto.company_name,
            source: dto.source ?? 'capture',
            visa_interest: dto.visa_interest,
            consent_given: true,
            consent_text: dto.consent_text,
            consent_at: new Date(),
            stage: 'captured',
        });
        await this.summaryService.refresh(prospect.id, {
            answers: dto.answers ?? undefined,
        });
        return prospect;
    }
    async create(data) {
        const human_ref = await this.generateHumanRef();
        return this.prospectRepository.create({
            ...data,
            human_ref,
            email: data.email?.toLowerCase(),
        });
    }
    async findById(id) {
        const prospect = await this.prospectRepository.findOneById(id);
        if (!prospect) {
            throw new common_1.NotFoundException('Prospect not found');
        }
        return prospect;
    }
    async findByHumanRef(humanRef) {
        const prospect = await this.prospectRepository.findByHumanRef(humanRef);
        if (!prospect) {
            throw new common_1.NotFoundException('Prospect not found');
        }
        return prospect;
    }
    async applyScreen(prospectId, flags) {
        return this.prospectRepository.update(prospectId, {
            statutory_eligible: flags.statutory_eligible,
            client_fit: flags.client_fit,
            stage: 'pre_screened',
        });
    }
    async advanceStage(prospectId, stage) {
        const prospect = await this.findById(prospectId);
        if (STAGE_ORDER[stage] <= STAGE_ORDER[prospect.stage]) {
            this.logger.debug(`Not advancing prospect ${prospect.human_ref} from ${prospect.stage} to ${stage}`);
            return prospect;
        }
        return this.prospectRepository.update(prospectId, { stage });
    }
    async linkSponsor(prospectId, sponsorId) {
        return this.prospectRepository.update(prospectId, { sponsor_id: sponsorId });
    }
    async list(page = 1, limit = 20, filters) {
        return this.prospectRepository.paginate(page, limit, filters);
    }
    async getPrepView(prospectId) {
        const prospect = await this.findById(prospectId);
        const summary = await this.summaryService.get(prospectId);
        return { prospect, summary };
    }
    async getPublicStatus(prospectId, humanRef) {
        const prospect = await this.prospectRepository.findOneById(prospectId);
        if (!prospect ||
            !humanRef ||
            prospect.human_ref.toUpperCase() !== humanRef.trim().toUpperCase()) {
            throw new common_1.NotFoundException('Prospect not found');
        }
        const booking = await this.bookingRepository.findLatestForProspect(prospectId);
        return {
            prospect_id: prospect.id,
            human_ref: prospect.human_ref,
            stage: prospect.stage,
            statutory_eligible: prospect.statutory_eligible ?? null,
            client_fit: prospect.client_fit ?? null,
            consult_confirmed: prospect.stage === 'booked',
            booking: booking
                ? {
                    id: booking.id,
                    status: booking.status,
                    scheduled_at: booking.scheduled_at ?? null,
                    scheduled_end_at: booking.scheduled_end_at ?? null,
                    join_url: booking.join_url ?? null,
                    reschedule_url: booking.reschedule_url ?? null,
                    cancel_url: booking.cancel_url ?? null,
                }
                : null,
        };
    }
    async generateHumanRef() {
        for (let attempt = 0; attempt < REF_MAX_ATTEMPTS; attempt++) {
            const candidate = REF_PREFIX +
                Array.from({ length: REF_LENGTH }, () => REF_ALPHABET[(0, crypto_1.randomInt)(REF_ALPHABET.length)]).join('');
            if (!(await this.prospectRepository.humanRefExists(candidate))) {
                return candidate;
            }
            this.logger.warn(`human_ref collision on ${candidate}, retrying`);
        }
        return `${REF_PREFIX}${Date.now().toString(36).toUpperCase()}`;
    }
};
exports.ProspectService = ProspectService;
exports.ProspectService = ProspectService = ProspectService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prospect_repository_1.ProspectRepository,
        prospect_summary_service_1.ProspectSummaryService,
        consultation_repository_1.ConsultationBookingRepository])
], ProspectService);
const STAGE_ORDER = {
    captured: 0,
    pre_screened: 1,
    booked: 2,
    consulted: 3,
    engaged: 4,
    disqualified: 5,
};
//# sourceMappingURL=prospect.service.js.map