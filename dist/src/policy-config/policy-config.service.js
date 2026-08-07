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
exports.PolicyConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const policy_config_entity_1 = require("./entities/policy-config.entity");
let PolicyConfigService = class PolicyConfigService {
    repo;
    cache = null;
    constructor(repo) {
        this.repo = repo;
    }
    async ensureLoaded() {
        if (this.cache)
            return this.cache;
        const rows = await this.repo.find();
        this.cache = new Map(rows.map((r) => [r.configKey, Number(r.numericValue)]));
        return this.cache;
    }
    async snapshot() {
        return this.ensureLoaded();
    }
    async getNumber(key, fallback) {
        const cache = await this.ensureLoaded();
        const value = cache.get(key);
        return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
    }
    static num(snapshot, key, fallback) {
        const value = snapshot.get(key);
        return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
    }
    async findAll() {
        return this.repo.find({ order: { category: 'ASC', label: 'ASC' } });
    }
    async update(configKey, dto) {
        const existing = await this.repo.findOne({ where: { configKey } });
        if (!existing) {
            throw new common_1.NotFoundException(`Policy config "${configKey}" not found`);
        }
        if (dto.numericValue !== undefined)
            existing.numericValue = dto.numericValue;
        if (dto.sourceNote !== undefined)
            existing.sourceNote = dto.sourceNote;
        if (dto.effectiveDate !== undefined) {
            existing.effectiveDate = dto.effectiveDate;
        }
        const saved = await this.repo.save(existing);
        this.cache = null;
        return saved;
    }
};
exports.PolicyConfigService = PolicyConfigService;
exports.PolicyConfigService = PolicyConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(policy_config_entity_1.PolicyConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PolicyConfigService);
//# sourceMappingURL=policy-config.service.js.map