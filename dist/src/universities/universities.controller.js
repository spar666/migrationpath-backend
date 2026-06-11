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
exports.UniversitiesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const universities_service_1 = require("./universities.service");
const university_dto_1 = require("./dto/university.dto");
const campus_dto_1 = require("./dto/campus.dto");
const course_dto_1 = require("./dto/course.dto");
const swagger_1 = require("@nestjs/swagger");
let UniversitiesController = class UniversitiesController {
    universitiesService;
    constructor(universitiesService) {
        this.universitiesService = universitiesService;
    }
    findAll() {
        return this.universitiesService.findAll();
    }
    findOne(id) {
        return this.universitiesService.findOne(id);
    }
    create(createUniversityDto) {
        return this.universitiesService.create(createUniversityDto);
    }
    update(id, updateUniversityDto) {
        return this.universitiesService.update(id, updateUniversityDto);
    }
    remove(id) {
        return this.universitiesService.remove(id);
    }
    getCampuses(id) {
        return this.universitiesService.getCampuses(id);
    }
    createCampus(createCampusDto) {
        return this.universitiesService.CreateCampus(createCampusDto);
    }
    updateCampus(id, updateCampusDto) {
        return this.universitiesService.updateCampus(id, updateCampusDto);
    }
    removeCampus(id) {
        return this.universitiesService.removeCampus(id);
    }
    findAllCourses(filters) {
        return this.universitiesService.findAllCourses(filters);
    }
    searchCourses(q, anzsco) {
        return this.universitiesService.searchCourses(q, anzsco);
    }
    createCourse(createCourseDto) {
        return this.universitiesService.createCourse(createCourseDto);
    }
    updateCourse(id, updateCourseDto) {
        return this.universitiesService.updateCourse(id, updateCourseDto);
    }
    removeCourse(id) {
        return this.universitiesService.removeCourse(id);
    }
};
exports.UniversitiesController = UniversitiesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all universities (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail with campuses & courses' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create university (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [university_dto_1.CreateUniversityDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update risk_level, cap (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, university_dto_1.UpdateUniversityDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete university (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/campuses'),
    (0, swagger_1.ApiOperation)({ summary: 'List campuses' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "getCampuses", null);
__decorate([
    (0, common_1.Post)('campuses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create campus (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [campus_dto_1.CreateCampusDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "createCampus", null);
__decorate([
    (0, common_1.Patch)('campuses/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update is_regional (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campus_dto_1.UpdateCampusDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "updateCampus", null);
__decorate([
    (0, common_1.Delete)('campuses/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete campus (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "removeCampus", null);
__decorate([
    (0, common_1.Get)('courses'),
    (0, swagger_1.ApiOperation)({ summary: 'List with filters (public)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "findAllCourses", null);
__decorate([
    (0, common_1.Get)('courses/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search with university & risk join' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('anzsco')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "searchCourses", null);
__decorate([
    (0, common_1.Post)('courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create course (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [course_dto_1.CreateCourseDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Patch)('courses/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update course (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_dto_1.UpdateCourseDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)('courses/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete course (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "removeCourse", null);
exports.UniversitiesController = UniversitiesController = __decorate([
    (0, swagger_1.ApiTags)('universities'),
    (0, common_1.Controller)('universities'),
    __metadata("design:paramtypes", [universities_service_1.UniversitiesService])
], UniversitiesController);
//# sourceMappingURL=universities.controller.js.map