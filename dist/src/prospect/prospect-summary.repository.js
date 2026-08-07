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
exports.ProspectSummaryRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const prospect_summary_entity_1 = require("./entities/prospect-summary.entity");
let ProspectSummaryRepository = class ProspectSummaryRepository extends base_repository_1.BaseRepository {
    summaryRepository;
    constructor(summaryRepository) {
        super(summaryRepository);
        this.summaryRepository = summaryRepository;
    }
    findByProspectId(prospectId) {
        return this.summaryRepository.findOne({
            where: { prospect_id: prospectId },
        });
    }
    async upsert(prospectId, patch) {
        const existing = await this.findByProspectId(prospectId);
        if (!existing) {
            const created = this.summaryRepository.create({
                prospect_id: prospectId,
                ...patch,
            });
            return this.summaryRepository.save(created);
        }
        Object.assign(existing, patch);
        return this.summaryRepository.save(existing);
    }
};
exports.ProspectSummaryRepository = ProspectSummaryRepository;
exports.ProspectSummaryRepository = ProspectSummaryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(prospect_summary_entity_1.ProspectSummary)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProspectSummaryRepository);
//# sourceMappingURL=prospect-summary.repository.js.map