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
var PreScreenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreScreenService = void 0;
const common_1 = require("@nestjs/common");
const prospect_service_1 = require("../prospect/prospect.service");
const prospect_summary_service_1 = require("../prospect/prospect-summary.service");
const occupations_service_1 = require("../occupations/occupations.service");
const sponsor_repository_1 = require("../employer-sponsored/sponsor.repository");
const nomination_repository_1 = require("../employer-sponsored/nomination.repository");
const employer_sponsored_engine_1 = require("../employer-sponsored/employer-sponsored.engine");
let PreScreenService = PreScreenService_1 = class PreScreenService {
    engine;
    prospectService;
    summaryService;
    occupationsService;
    sponsorRepository;
    nominationRepository;
    logger = new common_1.Logger(PreScreenService_1.name);
    constructor(engine, prospectService, summaryService, occupationsService, sponsorRepository, nominationRepository) {
        this.engine = engine;
        this.prospectService = prospectService;
        this.summaryService = summaryService;
        this.occupationsService = occupationsService;
        this.sponsorRepository = sponsorRepository;
        this.nominationRepository = nominationRepository;
    }
    onModuleInit() {
        this.engine.setOccupationListCheck((code, lists) => this.occupationsService.isOnAnyList(code, lists));
    }
    async submit(dto) {
        if (!dto.contact?.consent_given) {
            throw new common_1.BadRequestException('Consent is required before we can record your details.');
        }
        const { applicantFacts, sponsorFacts, nominationFacts } = this.buildFacts(dto);
        const result = await this.engine.assess({
            party: dto.party,
            applicant: applicantFacts,
            sponsor: sponsorFacts,
            nomination: nominationFacts,
        });
        const prospect = await this.prospectService.create({
            party: dto.party,
            full_name: dto.contact.full_name,
            email: dto.contact.email,
            phone: dto.contact.phone,
            company_name: sponsorFacts?.legal_name,
            source: dto.source ?? 'pre_screen',
            visa_interest: result.recommended_subclass
                ? `subclass_${result.recommended_subclass}`
                : nominationFacts?.subclass
                    ? `subclass_${nominationFacts.subclass}`
                    : undefined,
            consent_given: true,
            consent_text: dto.contact.consent_text,
            consent_at: new Date(),
            statutory_eligible: result.statutory_eligible,
            client_fit: result.client_fit,
            stage: 'pre_screened',
        });
        let sponsor = null;
        try {
            sponsor = await this.persistSponsorship(prospect.id, sponsorFacts, nominationFacts);
            if (sponsor) {
                await this.prospectService.linkSponsor(prospect.id, sponsor.id);
            }
        }
        catch (error) {
            this.logger.error(`Failed to persist sponsorship for prospect ${prospect.human_ref}: ${error.message}`);
        }
        await this.summaryService.refresh(prospect.id, {
            answers: dto.raw_answers ?? this.fallbackAnswers(dto),
            engine_result: result,
        });
        return this.toClientResult(prospect.id, prospect.human_ref, result);
    }
    buildFacts(dto) {
        if (dto.party === 'business') {
            if (!dto.business) {
                throw new common_1.BadRequestException('A business submission must include the business details.');
            }
            return {
                applicantFacts: dto.business.candidate,
                sponsorFacts: dto.business.sponsor,
                nominationFacts: dto.business.nomination,
            };
        }
        if (!dto.applicant) {
            throw new common_1.BadRequestException('An applicant submission must include the applicant details.');
        }
        return {
            applicantFacts: dto.applicant,
            sponsorFacts: dto.sponsoring_employer,
            nominationFacts: dto.offered_role,
        };
    }
    async persistSponsorship(prospectId, sponsorFacts, nominationFacts) {
        if (!sponsorFacts?.legal_name && !sponsorFacts?.abn) {
            return null;
        }
        const sponsor = await this.sponsorRepository.create({
            prospect_id: prospectId,
            legal_name: sponsorFacts.legal_name ?? 'Unnamed business',
            trading_name: sponsorFacts.trading_name,
            abn: sponsorFacts.abn?.replace(/\s/g, ''),
            industry: sponsorFacts.industry,
            employee_count: sponsorFacts.employee_count,
            years_trading: sponsorFacts.years_trading,
            state: sponsorFacts.state,
            postcode: sponsorFacts.postcode,
            business_address: sponsorFacts.business_address,
            sponsored_last_5_years: sponsorFacts.sponsored_last_5_years ?? null,
            is_standard_business_sponsor: sponsorFacts.is_standard_business_sponsor ?? null,
            annual_revenue_band: sponsorFacts.annual_revenue_band,
            years_operating_band: sponsorFacts.years_operating_band,
            operates_only_in_australia: sponsorFacts.operates_only_in_australia ?? null,
            employee_count_band: sponsorFacts.employee_count_band,
            has_temporary_visa_employees: sponsorFacts.has_temporary_visa_employees ?? null,
            referral_source: sponsorFacts.referral_source,
            sponsorship_status: (sponsorFacts.sponsorship_status ??
                'unknown'),
            has_adverse_information: sponsorFacts.has_adverse_information ?? null,
            meets_training_obligations: sponsorFacts.meets_training_obligations ?? null,
            raw_answers: sponsorFacts,
        });
        if (nominationFacts && Object.keys(nominationFacts).length > 0) {
            await this.nominationRepository.create({
                sponsor_id: sponsor.id,
                occupation_code: nominationFacts.occupation_code,
                occupation_name: nominationFacts.occupation_name,
                position_title: nominationFacts.position_title,
                subclass: nominationFacts.subclass,
                annual_salary: nominationFacts.annual_salary,
                salary_band: nominationFacts.salary_band,
                candidate_current_pay_band: nominationFacts.candidate_current_pay_band,
                work_state: nominationFacts.work_state,
                work_postcode: nominationFacts.work_postcode,
                is_regional: nominationFacts.is_regional ?? null,
                lmt_completed: nominationFacts.lmt_completed ?? null,
                status: 'draft',
                raw_answers: nominationFacts,
            });
        }
        return sponsor;
    }
    fallbackAnswers(dto) {
        return {
            party: dto.party,
            applicant: dto.applicant,
            business: dto.business,
            sponsoring_employer: dto.sponsoring_employer,
            offered_role: dto.offered_role,
        };
    }
    toClientResult(prospectId, humanRef, result) {
        const canBook = result.statutory_eligible && result.client_fit;
        const nextSteps = [];
        if (canBook) {
            nextSteps.push('Book a consultation with a registered migration agent to confirm ' +
                'this assessment and plan the application.');
        }
        else if (result.statutory_eligible && !result.client_fit) {
            nextSteps.push('Your situation looks workable, but it sits outside what we currently ' +
                'take on. Get in touch and we will point you to the right help.');
        }
        else if (!result.blockers.length && result.open_questions.length) {
            nextSteps.push('We could not complete your assessment because some answers are ' +
                'missing. Fill in the outstanding questions to get a result.');
        }
        else {
            nextSteps.push('Based on what you told us, an employer-sponsored pathway is not open ' +
                'to you right now.');
            if (result.open_questions.length) {
                nextSteps.push('Some answers were incomplete — filling those in may change this result.');
            }
        }
        return {
            prospect_id: prospectId,
            human_ref: humanRef,
            statutory_eligible: result.statutory_eligible,
            client_fit: result.client_fit,
            can_book: canBook,
            recommended_subclass: result.recommended_subclass,
            recommended_label: result.recommended_label,
            reasons: result.reasons,
            blockers: result.blockers,
            next_steps: nextSteps,
        };
    }
};
exports.PreScreenService = PreScreenService;
exports.PreScreenService = PreScreenService = PreScreenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [employer_sponsored_engine_1.EmployerSponsoredEngine,
        prospect_service_1.ProspectService,
        prospect_summary_service_1.ProspectSummaryService,
        occupations_service_1.OccupationsService,
        sponsor_repository_1.SponsorRepository,
        nomination_repository_1.NominationRepository])
], PreScreenService);
//# sourceMappingURL=pre-screen.service.js.map