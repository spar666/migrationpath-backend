"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataFreshnessModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const data_source_meta_entity_1 = require("./entities/data-source-meta.entity");
const data_freshness_service_1 = require("./data-freshness.service");
const data_freshness_controller_1 = require("./data-freshness.controller");
let DataFreshnessModule = class DataFreshnessModule {
};
exports.DataFreshnessModule = DataFreshnessModule;
exports.DataFreshnessModule = DataFreshnessModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([data_source_meta_entity_1.DataSourceMeta])],
        controllers: [data_freshness_controller_1.DataFreshnessController],
        providers: [data_freshness_service_1.DataFreshnessService],
        exports: [data_freshness_service_1.DataFreshnessService],
    })
], DataFreshnessModule);
//# sourceMappingURL=data-freshness.module.js.map