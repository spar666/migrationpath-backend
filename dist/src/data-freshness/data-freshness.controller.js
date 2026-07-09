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
exports.DataFreshnessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const data_freshness_service_1 = require("./data-freshness.service");
const update_data_source_dto_1 = require("./dto/update-data-source.dto");
let DataFreshnessController = class DataFreshnessController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    verify(domain) {
        return this.service.markVerified(domain);
    }
    update(domain, dto) {
        return this.service.update(domain, dto);
    }
};
exports.DataFreshnessController = DataFreshnessController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Freshness status of each legislative data domain' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DataFreshnessController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':domain/verify'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a domain as verified as of now' }),
    __param(0, (0, common_1.Param)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DataFreshnessController.prototype, "verify", null);
__decorate([
    (0, common_1.Put)(':domain'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a domain review cadence / source / notes' }),
    __param(0, (0, common_1.Param)('domain')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_data_source_dto_1.UpdateDataSourceDto]),
    __metadata("design:returntype", void 0)
], DataFreshnessController.prototype, "update", null);
exports.DataFreshnessController = DataFreshnessController = __decorate([
    (0, swagger_1.ApiTags)('admin/data-freshness'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Controller)('admin/data-freshness'),
    __metadata("design:paramtypes", [data_freshness_service_1.DataFreshnessService])
], DataFreshnessController);
//# sourceMappingURL=data-freshness.controller.js.map