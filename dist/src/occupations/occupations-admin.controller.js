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
exports.OccupationsAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const occupations_service_1 = require("./occupations.service");
const occupation_list_import_service_1 = require("./occupation-list-import.service");
const sync_visas_dto_1 = require("./dto/sync-visas.dto");
const import_occupation_lists_dto_1 = require("./dto/import-occupation-lists.dto");
let OccupationsAdminController = class OccupationsAdminController {
    occupationsService;
    listImportService;
    constructor(occupationsService, listImportService) {
        this.occupationsService = occupationsService;
        this.listImportService = listImportService;
    }
    syncVisas(dto) {
        return this.occupationsService.syncVisas(dto);
    }
    importLists(dto) {
        return this.listImportService.importLists(dto);
    }
};
exports.OccupationsAdminController = OccupationsAdminController;
__decorate([
    (0, common_1.Post)('sync-visas'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk resolve/update occupation<->visa links from the legislative matrix (admin)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sync_visas_dto_1.SyncVisasDto]),
    __metadata("design:returntype", void 0)
], OccupationsAdminController.prototype, "syncVisas", null);
__decorate([
    (0, common_1.Post)('import-lists'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk import skilled-list membership (MLTSSL/STSOL/ROL/CSOL) by ANZSCO code (admin)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_occupation_lists_dto_1.ImportOccupationListsDto]),
    __metadata("design:returntype", void 0)
], OccupationsAdminController.prototype, "importLists", null);
exports.OccupationsAdminController = OccupationsAdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Controller)('admin/occupations'),
    __metadata("design:paramtypes", [occupations_service_1.OccupationsService,
        occupation_list_import_service_1.OccupationListImportService])
], OccupationsAdminController);
//# sourceMappingURL=occupations-admin.controller.js.map