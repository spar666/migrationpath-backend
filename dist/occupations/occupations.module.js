"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccupationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const occupations_service_1 = require("./occupations.service");
const occupations_controller_1 = require("./occupations.controller");
const occupations_admin_controller_1 = require("./occupations-admin.controller");
const occupation_list_import_service_1 = require("./occupation-list-import.service");
const occupation_entity_1 = require("./entities/occupation.entity");
const visa_entity_1 = require("./entities/visa.entity");
const occupation_visa_entity_1 = require("./entities/occupation-visa.entity");
let OccupationsModule = class OccupationsModule {
};
exports.OccupationsModule = OccupationsModule;
exports.OccupationsModule = OccupationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                occupation_entity_1.Occupation,
                occupation_entity_1.OccupationThreshold,
                visa_entity_1.Visa,
                occupation_visa_entity_1.OccupationVisa,
            ]),
        ],
        controllers: [occupations_controller_1.OccupationsController, occupations_admin_controller_1.OccupationsAdminController],
        providers: [occupations_service_1.OccupationsService, occupation_list_import_service_1.OccupationListImportService],
        exports: [occupations_service_1.OccupationsService],
    })
], OccupationsModule);
//# sourceMappingURL=occupations.module.js.map