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
var ProspectSummaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProspectSummaryService = void 0;
const common_1 = require("@nestjs/common");
const prospect_summary_repository_1 = require("./prospect-summary.repository");
const prospect_repository_1 = require("./prospect.repository");
const sponsor_repository_1 = require("../employer-sponsored/sponsor.repository");
const nomination_repository_1 = require("../employer-sponsored/nomination.repository");
const consultation_repository_1 = require("../consultation/consultation.repository");
let ProspectSummaryService = ProspectSummaryService_1 = class ProspectSummaryService {
    summaryRepository;
    prospectRepository;
    sponsorRepository;
    nominationRepository;
    bookingRepository;
    logger = new common_1.Logger(ProspectSummaryService_1.name);
    constructor(summaryRepository, prospectRepository, sponsorRepository, nominationRepository, bookingRepository) {
        this.summaryRepository = summaryRepository;
        this.prospectRepository = prospectRepository;
        this.sponsorRepository = sponsorRepository;
        this.nominationRepository = nominationRepository;
        this.bookingRepository = bookingRepository;
    }
    get(prospectId) {
        return this.summaryRepository.findByProspectId(prospectId);
    }
    async refresh(prospectId, patch = {}) {
        try {
            const prospect = await this.prospectRepository.findOneById(prospectId);
            if (!prospect) {
                this.logger.warn(`refresh() called for unknown prospect ${prospectId} — skipping`);
                return null;
            }
            const sponsorship = await this.buildSponsorship(prospect.sponsor_id);
            const booking = patch.booking ?? (await this.buildBooking(prospectId));
            const eligibility = patch.eligibility ??
                (patch.engine_result
                    ? {
                        statutory_eligible: patch.engine_result.statutory_eligible,
                        client_fit: patch.engine_result.client_fit,
                        recommended_subclass: patch.engine_result.recommended_subclass,
                        reasons: patch.engine_result.reasons,
                        blockers: patch.engine_result.blockers,
                        open_questions: patch.engine_result.open_questions,
                    }
                    : {
                        statutory_eligible: prospect.statutory_eligible,
                        client_fit: prospect.client_fit,
                    });
            return await this.summaryRepository.upsert(prospectId, {
                headline: this.buildHeadline(prospect.full_name, prospect.party, prospect.company_name, eligibility?.recommended_subclass),
                eligibility,
                ...(patch.answers !== undefined ? { answers: patch.answers } : {}),
                ...(patch.engine_result !== undefined
                    ? { engine_result: patch.engine_result }
                    : {}),
                ...(sponsorship ? { sponsorship } : {}),
                ...(booking ? { booking } : {}),
                ...(patch.payment !== undefined ? { payment: patch.payment } : {}),
            });
        }
        catch (error) {
            this.logger.error(`Failed to refresh summary for prospect ${prospectId}: ${error.message}`);
            return null;
        }
    }
    buildHeadline(fullName, party, companyName, subclass) {
        const who = party === 'business' && companyName
            ? `${companyName} (${fullName})`
            : fullName;
        const what = subclass ? `subclass ${subclass}` : 'pathway TBC';
        return `${who} — ${party} — ${what}`;
    }
    async buildSponsorship(sponsorId) {
        if (!sponsorId)
            return null;
        const sponsor = await this.sponsorRepository.findWithNominations(sponsorId);
        if (!sponsor)
            return null;
        const nominations = sponsor.nominations ??
            (await this.nominationRepository.findBySponsorId(sponsorId));
        return {
            sponsor: {
                id: sponsor.id,
                legal_name: sponsor.legal_name,
                abn: sponsor.abn,
                industry: sponsor.industry,
                employee_count: sponsor.employee_count,
                years_trading: sponsor.years_trading,
                sponsorship_status: sponsor.sponsorship_status,
                state: sponsor.state,
            },
            nominations: (nominations ?? []).map((n) => ({
                id: n.id,
                occupation_code: n.occupation_code,
                occupation_name: n.occupation_name,
                subclass: n.subclass,
                annual_salary: n.annual_salary,
                work_state: n.work_state,
                is_regional: n.is_regional,
                status: n.status,
                applicant_prospect_id: n.applicant_prospect_id,
            })),
        };
    }
    async buildBooking(prospectId) {
        const bookings = await this.bookingRepository.findAll({
            prospect_id: prospectId,
        });
        if (!bookings?.length)
            return null;
        const [booking] = bookings.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        return {
            booking_id: booking.id,
            status: booking.status,
            scheduled_at: booking.scheduled_at,
            scheduled_end_at: booking.scheduled_end_at,
            join_url: booking.join_url,
            reschedule_url: booking.reschedule_url,
            cancel_url: booking.cancel_url,
        };
    }
};
exports.ProspectSummaryService = ProspectSummaryService;
exports.ProspectSummaryService = ProspectSummaryService = ProspectSummaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prospect_summary_repository_1.ProspectSummaryRepository,
        prospect_repository_1.ProspectRepository,
        sponsor_repository_1.SponsorRepository,
        nomination_repository_1.NominationRepository,
        consultation_repository_1.ConsultationBookingRepository])
], ProspectSummaryService);
//# sourceMappingURL=prospect-summary.service.js.map