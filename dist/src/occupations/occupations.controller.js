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
exports.OccupationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const occupations_service_1 = require("./occupations.service");
const occupation_dto_1 = require("./dto/occupation.dto");
const swagger_1 = require("@nestjs/swagger");
let OccupationsController = class OccupationsController {
    occupationsService;
    constructor(occupationsService) {
        this.occupationsService = occupationsService;
    }
    search(query) {
        return this.occupationsService.searchOccupations(query);
    }
    findAll(filters) {
        return this.occupationsService.findAll(filters);
    }
    getThresholds() {
        return this.occupationsService.getThresholds();
    }
    findOne(anzsco) {
        return this.occupationsService.findOne(anzsco);
    }
    create(createOccupationDto) {
        return this.occupationsService.create(createOccupationDto);
    }
    update(anzsco, updateOccupationDto) {
        return this.occupationsService.update(anzsco, updateOccupationDto);
    }
    remove(anzsco) {
        return this.occupationsService.remove(anzsco);
    }
};
exports.OccupationsController = OccupationsController;
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({
        summary: 'Advanced search with filters (q, assessing_authority, state_code)',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OccupationsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List with search & filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OccupationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('thresholds'),
    (0, swagger_1.ApiOperation)({ summary: 'All thresholds for invitation tracking' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OccupationsController.prototype, "getThresholds", null);
__decorate([
    (0, common_1.Get)(':anzsco'),
    (0, swagger_1.ApiOperation)({
        summary: 'Occupation detail including thresholds and the array of active eligible visas',
    }),
    __param(0, (0, common_1.Param)('anzsco')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OccupationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create occupation (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [occupation_dto_1.CreateOccupationDto]),
    __metadata("design:returntype", void 0)
], OccupationsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':anzsco'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update occupation by ANZSCO code (admin)' }),
    __param(0, (0, common_1.Param)('anzsco')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, occupation_dto_1.UpdateOccupationDto]),
    __metadata("design:returntype", void 0)
], OccupationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':anzsco'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete occupation by ANZSCO code (admin)' }),
    __param(0, (0, common_1.Param)('anzsco')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OccupationsController.prototype, "remove", null);
exports.OccupationsController = OccupationsController = __decorate([
    (0, swagger_1.ApiTags)('occupations'),
    (0, common_1.Controller)('occupations'),
    __metadata("design:paramtypes", [occupations_service_1.OccupationsService])
], OccupationsController);
//# sourceMappingURL=occupations.controller.js.map