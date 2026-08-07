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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const nomination_entity_1 = require("./entities/nomination.entity");
let NominationRepository = class NominationRepository extends base_repository_1.BaseRepository {
    nominationRepository;
    constructor(nominationRepository) {
        super(nominationRepository);
        this.nominationRepository = nominationRepository;
    }
    findBySponsorId(sponsorId) {
        return this.nominationRepository.find({
            where: { sponsor_id: sponsorId },
            order: { created_at: 'DESC' },
        });
    }
    findByApplicantProspectId(prospectId) {
        return this.nominationRepository.find({
            where: { applicant_prospect_id: prospectId },
            order: { created_at: 'DESC' },
        });
    }
    findOpen() {
        return this.nominationRepository.find({
            where: { status: 'open', applicant_prospect_id: null },
            order: { created_at: 'DESC' },
        });
    }
    async matchApplicant(nominationId, applicantProspectId) {
        await this.nominationRepository.update(nominationId, {
            applicant_prospect_id: applicantProspectId,
            status: 'matched',
        });
        return this.findById(nominationId);
    }
};
exports.NominationRepository = NominationRepository;
exports.NominationRepository = NominationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(nomination_entity_1.Nomination)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NominationRepository);
//# sourceMappingURL=nomination.repository.js.map