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
var RegionalPostcodeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionalPostcodeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const regional_postcode_band_entity_1 = require("./entities/regional-postcode-band.entity");
const STATIC_FALLBACK = {
    metro: [
        { region: 'Greater Sydney', ranges: [[2000, 2249], [2555, 2574], [2745, 2786]] },
        { region: 'Greater Melbourne', ranges: [[3000, 3207], [3335, 3341], [3427, 3443], [3750, 3810], [3910, 3944], [3975, 3978], [8000, 8999]] },
        { region: 'Greater Brisbane', ranges: [[4000, 4207], [4300, 4305], [4500, 4519]] },
    ],
    cat2: [
        { region: 'Wollongong / Illawarra', ranges: [[2500, 2534]] },
        { region: 'Newcastle / Lake Macquarie', ranges: [[2280, 2310]] },
        { region: 'Canberra (ACT)', ranges: [[2600, 2620], [2900, 2920]] },
        { region: 'Geelong', ranges: [[3211, 3230]] },
        { region: 'Gold Coast', ranges: [[4208, 4287]] },
        { region: 'Sunshine Coast', ranges: [[4550, 4575]] },
        { region: 'Perth', ranges: [[6000, 6199]] },
        { region: 'Adelaide', ranges: [[5000, 5199]] },
        { region: 'Hobart', ranges: [[7000, 7099]] },
    ],
    cat3: [
        { region: 'Ballarat', ranges: [[3350, 3356]] },
        { region: 'Bendigo', ranges: [[3550, 3556]] },
        { region: 'Toowoomba', ranges: [[4350, 4390]] },
        { region: 'Townsville', ranges: [[4810, 4825]] },
        { region: 'Cairns', ranges: [[4868, 4879]] },
        { region: 'Wagga Wagga', ranges: [[2650, 2652]] },
        { region: 'Albury', ranges: [[2640, 2642]] },
        { region: 'Launceston', ranges: [[7248, 7325]] },
        { region: 'Darwin (NT)', ranges: [[800, 832]] },
    ],
};
let RegionalPostcodeService = RegionalPostcodeService_1 = class RegionalPostcodeService {
    repo;
    logger = new common_1.Logger(RegionalPostcodeService_1.name);
    cache = null;
    constructor(repo) {
        this.repo = repo;
    }
    async onModuleInit() {
        try {
            await this.reload();
        }
        catch (err) {
            this.logger.warn(`Could not warm regional postcode cache at boot — using static fallback. ${err}`);
        }
    }
    getCachedBands() {
        return this.cache ?? STATIC_FALLBACK;
    }
    async reload() {
        const rows = await this.repo.find({ where: { isActive: true } });
        if (!rows.length) {
            this.cache = null;
            return;
        }
        const group = (cat) => {
            const byRegion = new Map();
            rows
                .filter((r) => r.category === cat)
                .forEach((r) => {
                const list = byRegion.get(r.region) ?? [];
                list.push([r.postcodeFrom, r.postcodeTo]);
                byRegion.set(r.region, list);
            });
            return Array.from(byRegion.entries()).map(([region, ranges]) => ({
                region,
                ranges,
            }));
        };
        this.cache = {
            metro: group('METRO'),
            cat2: group('CATEGORY_2'),
            cat3: group('CATEGORY_3'),
        };
    }
    findAll() {
        return this.repo.find({
            order: { category: 'ASC', postcodeFrom: 'ASC' },
        });
    }
    async create(dto) {
        const band = this.repo.create({ ...dto, isActive: dto.isActive ?? true });
        const saved = await this.repo.save(band);
        await this.reload();
        return saved;
    }
    async update(id, dto) {
        const existing = await this.repo.findOne({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Band ${id} not found`);
        Object.assign(existing, dto);
        const saved = await this.repo.save(existing);
        await this.reload();
        return saved;
    }
    async remove(id) {
        const res = await this.repo.delete(id);
        if (!res.affected)
            throw new common_1.NotFoundException(`Band ${id} not found`);
        await this.reload();
        return { success: true };
    }
    async bulkImport(dto) {
        let deactivated = 0;
        if (dto.replaceAll) {
            const res = await this.repo.update({ isActive: true }, { isActive: false });
            deactivated = res.affected ?? 0;
        }
        const entities = dto.rows.map((r) => this.repo.create({ ...r, isActive: r.isActive ?? true }));
        await this.repo.save(entities);
        await this.reload();
        return { imported: entities.length, deactivated };
    }
};
exports.RegionalPostcodeService = RegionalPostcodeService;
exports.RegionalPostcodeService = RegionalPostcodeService = RegionalPostcodeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(regional_postcode_band_entity_1.RegionalPostcodeBand)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RegionalPostcodeService);
//# sourceMappingURL=regional-postcode.service.js.map