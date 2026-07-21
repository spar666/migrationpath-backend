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
exports.OccupationListImportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const occupation_entity_1 = require("./entities/occupation.entity");
const occupations_service_1 = require("./occupations.service");
let OccupationListImportService = class OccupationListImportService {
    occRepo;
    occupationsService;
    constructor(occRepo, occupationsService) {
        this.occRepo = occRepo;
        this.occupationsService = occupationsService;
    }
    async importLists(dto) {
        const updatedCodes = [];
        const notFound = [];
        for (const row of dto.rows) {
            const occ = await this.occRepo.findOne({
                where: { anzsco_code: row.anzscoCode },
            });
            if (!occ) {
                notFound.push(row.anzscoCode);
                continue;
            }
            occ.primary_list = row.primaryList;
            await this.occRepo.save(occ);
            updatedCodes.push(row.anzscoCode);
        }
        let visasResynced = false;
        if (dto.resyncVisas !== false && updatedCodes.length > 0) {
            await this.occupationsService.syncVisas({ anzscoCodes: updatedCodes });
            visasResynced = true;
        }
        return {
            updated: updatedCodes.length,
            updatedCodes,
            notFound,
            visasResynced,
        };
    }
};
exports.OccupationListImportService = OccupationListImportService;
exports.OccupationListImportService = OccupationListImportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(occupation_entity_1.Occupation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        occupations_service_1.OccupationsService])
], OccupationListImportService);
//# sourceMappingURL=occupation-list-import.service.js.map