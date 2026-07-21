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
exports.MigrationRuleService = void 0;
const common_1 = require("@nestjs/common");
const migration_rule_repository_1 = require("./migration-rule.repository");
let MigrationRuleService = class MigrationRuleService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        return this.repo.create(dto);
    }
    async findAll() {
        return this.repo.findAll();
    }
    async findOne(id) {
        return this.repo.findById(id);
    }
    async update(id, dto) {
        return this.repo.update(id, dto);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
    async findByPersonaType(persona_type) {
        return this.repo.findByPersonaType(persona_type);
    }
};
exports.MigrationRuleService = MigrationRuleService;
exports.MigrationRuleService = MigrationRuleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [migration_rule_repository_1.MigrationRuleRepository])
], MigrationRuleService);
//# sourceMappingURL=migration-rule.service.js.map