"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRuleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const migration_rule_controller_1 = require("./migration-rule.controller");
const migration_rule_service_1 = require("./migration-rule.service");
const migration_rule_repository_1 = require("./migration-rule.repository");
const migration_rule_entity_1 = require("./entities/migration-rule.entity");
let MigrationRuleModule = class MigrationRuleModule {
};
exports.MigrationRuleModule = MigrationRuleModule;
exports.MigrationRuleModule = MigrationRuleModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([migration_rule_entity_1.MigrationRule])],
        controllers: [migration_rule_controller_1.MigrationRuleController],
        providers: [migration_rule_service_1.MigrationRuleService, migration_rule_repository_1.MigrationRuleRepository],
        exports: [migration_rule_service_1.MigrationRuleService, migration_rule_repository_1.MigrationRuleRepository],
    })
], MigrationRuleModule);
//# sourceMappingURL=migration-rule.module.js.map