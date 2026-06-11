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
exports.OccupationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const occupation_entity_1 = require("./entities/occupation.entity");
let OccupationsService = class OccupationsService {
    occupationRepository;
    thresholdRepository;
    constructor(occupationRepository, thresholdRepository) {
        this.occupationRepository = occupationRepository;
        this.thresholdRepository = thresholdRepository;
    }
    async findAll(filters) {
        return this.occupationRepository.find({
            where: filters,
        });
    }
    async searchOccupations(query) {
        const { q, assessing_authority, state_code, is_available, page = 1, limit = 10, } = query;
        const qb = this.occupationRepository.createQueryBuilder('occupation');
        if (q) {
            qb.andWhere('(occupation.occupation_name ILIKE :q OR occupation.anzsco_code ILIKE :q)', { q: `%${q}%` });
        }
        if (assessing_authority) {
            qb.andWhere('occupation.assessing_authority = :assessing_authority', {
                assessing_authority,
            });
        }
        if (state_code || is_available !== undefined) {
            qb.innerJoinAndSelect('occupation.thresholds', 'threshold');
            if (state_code) {
                qb.andWhere('threshold.state_code = :state_code', { state_code });
            }
            if (is_available !== undefined) {
                qb.andWhere('threshold.is_available = :is_available', {
                    is_available: is_available === 'true' || is_available === true,
                });
            }
        }
        else {
            qb.leftJoinAndSelect('occupation.thresholds', 'threshold');
        }
        const skip = (Number(page) - 1) * Number(limit);
        qb.skip(skip).take(Number(limit));
        const [data, total] = await qb.getManyAndCount();
        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        };
    }
    async findOne(anzscoCode) {
        const occupation = await this.occupationRepository.findOne({
            where: { anzsco_code: anzscoCode },
            relations: ['thresholds'],
        });
        if (!occupation)
            throw new common_1.NotFoundException(`Occupation with ANZSCO ${anzscoCode} not found`);
        return occupation;
    }
    async create(dto) {
        const occupation = this.occupationRepository.create({
            occupation_name: dto.title,
            anzsco_code: dto.anzscoCode,
            assessing_authority: dto.assessingAuthority,
            points_value: dto.pointsValue ?? 0,
        });
        return this.occupationRepository.save(occupation);
    }
    async update(id, dto) {
        const updateData = {};
        if (dto.title)
            updateData.occupation_name = dto.title;
        if (dto.anzscoCode)
            updateData.anzsco_code = dto.anzscoCode;
        if (dto.assessingAuthority)
            updateData.assessing_authority = dto.assessingAuthority;
        if (dto.pointsValue !== undefined)
            updateData.points_value = dto.pointsValue;
        await this.occupationRepository.update(id, updateData);
        return this.occupationRepository.findOne({ where: { id } });
    }
    async remove(id) {
        await this.occupationRepository.delete(id);
        return { success: true };
    }
    async getThresholds() {
        return this.thresholdRepository.find({
            relations: ['occupation'],
        });
    }
};
exports.OccupationsService = OccupationsService;
exports.OccupationsService = OccupationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(occupation_entity_1.Occupation)),
    __param(1, (0, typeorm_1.InjectRepository)(occupation_entity_1.OccupationThreshold)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OccupationsService);
//# sourceMappingURL=occupations.service.js.map