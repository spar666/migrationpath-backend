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
exports.SponsorRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const sponsor_entity_1 = require("./entities/sponsor.entity");
let SponsorRepository = class SponsorRepository extends base_repository_1.BaseRepository {
    sponsorRepository;
    constructor(sponsorRepository) {
        super(sponsorRepository);
        this.sponsorRepository = sponsorRepository;
    }
    findByProspectId(prospectId) {
        return this.sponsorRepository.findOne({
            where: { prospect_id: prospectId },
            order: { created_at: 'DESC' },
        });
    }
    findWithNominations(sponsorId) {
        return this.sponsorRepository.findOne({
            where: { id: sponsorId },
            relations: ['nominations'],
        });
    }
};
exports.SponsorRepository = SponsorRepository;
exports.SponsorRepository = SponsorRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sponsor_entity_1.Sponsor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SponsorRepository);
//# sourceMappingURL=sponsor.repository.js.map