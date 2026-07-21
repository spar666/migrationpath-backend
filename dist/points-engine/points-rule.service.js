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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsRuleService = void 0;
const common_1 = require("@nestjs/common");
const points_rule_repository_1 = require("./points-rule.repository");
let PointsRuleService = class PointsRuleService {
    pointsRuleRepo;
    constructor(pointsRuleRepo) {
        this.pointsRuleRepo = pointsRuleRepo;
    }
    async create(dto) {
        return this.pointsRuleRepo.create(dto);
    }
    async findAll() {
        return this.pointsRuleRepo.findAll();
    }
    async findOne(id) {
        const rule = await this.pointsRuleRepo.findById(id);
        if (!rule) {
            throw new common_1.NotFoundException(`Points rule with ID ${id} not found`);
        }
        return rule;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.pointsRuleRepo.update(id, dto);
    }
    async remove(id) {
        await this.findOne(id);
        await this.pointsRuleRepo.delete(id);
    }
    async findByCategory(category, visa_group) {
        return this.pointsRuleRepo.findActiveByCategory(category, visa_group);
    }
    async findActive(visa_group) {
        return this.pointsRuleRepo.findActive(visa_group);
    }
    async toggleActive(id) {
        const rule = await this.findOne(id);
        return this.pointsRuleRepo.update(id, {
            is_active: !rule.is_active,
        });
    }
};
exports.PointsRuleService = PointsRuleService;
exports.PointsRuleService = PointsRuleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [points_rule_repository_1.PointsRuleRepository])
], PointsRuleService);
//# sourceMappingURL=points-rule.service.js.map