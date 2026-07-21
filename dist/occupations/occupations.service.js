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
var OccupationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccupationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const occupation_entity_1 = require("./entities/occupation.entity");
const visa_entity_1 = require("./entities/visa.entity");
const occupation_visa_entity_1 = require("./entities/occupation-visa.entity");
const visa_mapping_1 = require("./constants/visa-mapping");
let OccupationsService = OccupationsService_1 = class OccupationsService {
    occupationRepository;
    thresholdRepository;
    visaRepository;
    occupationVisaRepository;
    dataSource;
    logger = new common_1.Logger(OccupationsService_1.name);
    constructor(occupationRepository, thresholdRepository, visaRepository, occupationVisaRepository, dataSource) {
        this.occupationRepository = occupationRepository;
        this.thresholdRepository = thresholdRepository;
        this.visaRepository = visaRepository;
        this.occupationVisaRepository = occupationVisaRepository;
        this.dataSource = dataSource;
    }
    async findAll(filters) {
        return this.occupationRepository.find({ where: filters });
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
        if (!occupation) {
            throw new common_1.NotFoundException(`Occupation with ANZSCO ${anzscoCode} not found`);
        }
        const eligibleVisas = await this.getEligibleVisas(anzscoCode);
        return { ...occupation, eligibleVisas };
    }
    async getEligibleVisas(anzscoCode) {
        const rows = await this.occupationVisaRepository
            .createQueryBuilder('ov')
            .innerJoinAndSelect('ov.visa', 'visa')
            .where('ov.occupation_anzsco_code = :anzscoCode', { anzscoCode })
            .andWhere('ov.is_active = :active', { active: true })
            .andWhere('visa.is_active = :active', { active: true })
            .orderBy('visa.subclass_number', 'ASC')
            .getMany();
        return rows.map((row) => ({
            id: row.visa.id,
            subclassNumber: row.visa.subclass_number,
            streamTitle: row.visa.stream_title,
            residencyType: row.visa.residency_type,
            name: row.visa.name,
            caveats: row.caveats,
        }));
    }
    async create(dto) {
        const occupation = this.occupationRepository.create({
            anzsco_code: dto.anzscoCode,
            occupation_name: dto.title,
            description: dto.description ?? null,
            assessing_authority: dto.assessingAuthority ?? null,
            points_value: dto.pointsValue ?? 0,
            primary_list: dto.primaryList ?? null,
        });
        await this.occupationRepository.save(occupation);
        await this.dataSource.transaction((manager) => this.resolveVisasForOccupation(dto.anzscoCode, dto.primaryList ?? null, manager, true));
        return this.findOne(dto.anzscoCode);
    }
    async update(anzscoCode, dto) {
        const existing = await this.occupationRepository.findOne({
            where: { anzsco_code: anzscoCode },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Occupation with ANZSCO ${anzscoCode} not found`);
        }
        if (dto.title !== undefined)
            existing.occupation_name = dto.title;
        if (dto.description !== undefined)
            existing.description = dto.description;
        if (dto.assessingAuthority !== undefined)
            existing.assessing_authority = dto.assessingAuthority;
        if (dto.pointsValue !== undefined)
            existing.points_value = dto.pointsValue;
        const listChanged = dto.primaryList !== undefined && dto.primaryList !== existing.primary_list;
        if (dto.primaryList !== undefined)
            existing.primary_list = dto.primaryList;
        await this.occupationRepository.save(existing);
        if (listChanged) {
            await this.dataSource.transaction((manager) => this.resolveVisasForOccupation(anzscoCode, existing.primary_list, manager, true));
        }
        return this.findOne(anzscoCode);
    }
    async remove(anzscoCode) {
        const result = await this.occupationRepository.delete({
            anzsco_code: anzscoCode,
        });
        if (!result.affected) {
            throw new common_1.NotFoundException(`Occupation with ANZSCO ${anzscoCode} not found`);
        }
        return { success: true };
    }
    async getThresholds() {
        return this.thresholdRepository.find({ relations: ['occupation'] });
    }
    async getCanonicalNameMap(anzscoCodes) {
        const occupations = await this.occupationRepository.find({
            where: anzscoCodes?.length
                ? { anzsco_code: (0, typeorm_2.In)(anzscoCodes) }
                : {},
            select: ['anzsco_code', 'occupation_name'],
        });
        return occupations.reduce((map, occ) => {
            map[occ.anzsco_code] = occ.occupation_name;
            return map;
        }, {});
    }
    async syncVisas(dto = {}) {
        const deactivateStale = dto.deactivateStale ?? true;
        return this.dataSource.transaction(async (manager) => {
            const occupationRepo = manager.getRepository(occupation_entity_1.Occupation);
            const occupations = await occupationRepo.find({
                where: dto.anzscoCodes?.length
                    ? { anzsco_code: (0, typeorm_2.In)(dto.anzscoCodes) }
                    : {},
            });
            const result = {
                occupationsProcessed: 0,
                linksCreated: 0,
                linksReactivated: 0,
                linksDeactivated: 0,
                skippedUnclassified: 0,
            };
            for (const occupation of occupations) {
                if (!occupation.primary_list) {
                    result.skippedUnclassified += 1;
                    continue;
                }
                const perOccupation = await this.resolveVisasForOccupation(occupation.anzsco_code, occupation.primary_list, manager, deactivateStale);
                result.occupationsProcessed += 1;
                result.linksCreated += perOccupation.created;
                result.linksReactivated += perOccupation.reactivated;
                result.linksDeactivated += perOccupation.deactivated;
            }
            this.logger.log(`sync-visas complete: ${JSON.stringify(result)}`);
            return result;
        });
    }
    async resolveVisasForOccupation(anzscoCode, primaryList, manager, deactivateStale) {
        const visaRepo = manager.getRepository(visa_entity_1.Visa);
        const occupationVisaRepo = manager.getRepository(occupation_visa_entity_1.OccupationVisa);
        const targetSubclasses = (0, visa_mapping_1.resolveEligibleSubclasses)(primaryList);
        const targetVisas = targetSubclasses.length
            ? await visaRepo.find({
                where: { subclass_number: (0, typeorm_2.In)(targetSubclasses), is_active: true },
            })
            : [];
        const targetVisaIds = new Set(targetVisas.map((v) => v.id));
        const existingLinks = await occupationVisaRepo.find({
            where: { occupation_anzsco_code: anzscoCode },
        });
        const existingByVisaId = new Map(existingLinks.map((link) => [link.visa_id, link]));
        let created = 0;
        let reactivated = 0;
        let deactivated = 0;
        for (const visa of targetVisas) {
            const existing = existingByVisaId.get(visa.id);
            if (!existing) {
                await occupationVisaRepo.save(occupationVisaRepo.create({
                    occupation_anzsco_code: anzscoCode,
                    visa_id: visa.id,
                    is_active: true,
                    caveats: null,
                }));
                created += 1;
            }
            else if (!existing.is_active) {
                existing.is_active = true;
                await occupationVisaRepo.save(existing);
                reactivated += 1;
            }
        }
        if (deactivateStale) {
            for (const link of existingLinks) {
                if (!targetVisaIds.has(link.visa_id) && link.is_active) {
                    link.is_active = false;
                    await occupationVisaRepo.save(link);
                    deactivated += 1;
                }
            }
        }
        return { created, reactivated, deactivated };
    }
};
exports.OccupationsService = OccupationsService;
exports.OccupationsService = OccupationsService = OccupationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(occupation_entity_1.Occupation)),
    __param(1, (0, typeorm_1.InjectRepository)(occupation_entity_1.OccupationThreshold)),
    __param(2, (0, typeorm_1.InjectRepository)(visa_entity_1.Visa)),
    __param(3, (0, typeorm_1.InjectRepository)(occupation_visa_entity_1.OccupationVisa)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], OccupationsService);
//# sourceMappingURL=occupations.service.js.map