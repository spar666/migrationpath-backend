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
exports.UniversitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const university_entity_1 = require("./entities/university.entity");
let UniversitiesService = class UniversitiesService {
    universityRepository;
    campusRepository;
    courseRepository;
    constructor(universityRepository, campusRepository, courseRepository) {
        this.universityRepository = universityRepository;
        this.campusRepository = campusRepository;
        this.courseRepository = courseRepository;
    }
    async findAll() {
        return this.universityRepository.find({
            relations: ['campuses'],
        });
    }
    async findOne(id) {
        const university = await this.universityRepository.findOne({
            where: { id },
            relations: ['campuses', 'campuses.courses'],
        });
        if (!university)
            throw new common_1.NotFoundException(`University with ID ${id} not found`);
        return university;
    }
    async create(dto) {
        const university = this.universityRepository.create(dto);
        return this.universityRepository.save(university);
    }
    async update(id, dto) {
        await this.universityRepository.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.universityRepository.delete(id);
        return { success: true };
    }
    async getCampuses(universityId) {
        return this.campusRepository.find({
            where: { universityId },
        });
    }
    async CreateCampus(dto) {
        const campus = this.campusRepository.create(dto);
        return this.campusRepository.save(campus);
    }
    async updateCampus(id, dto) {
        await this.campusRepository.update(id, dto);
        return this.campusRepository.findOne({ where: { id } });
    }
    async removeCampus(id) {
        await this.campusRepository.delete(id);
        return { success: true };
    }
    async findAllCourses(filters) {
        const finalFilters = {
            isActive: true,
            ...filters,
        };
        return this.courseRepository.find({
            where: finalFilters,
            relations: ['campus', 'university'],
        });
    }
    async searchCourses(q, anzsco) {
        const query = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.university', 'university')
            .leftJoinAndSelect('course.campus', 'campus');
        if (q) {
            query.andWhere('course.courseTitle ILIKE :q', { q: `%${q}%` });
        }
        if (anzsco) {
            query.andWhere('course.anzscoCode = :anzsco', { anzsco });
        }
        return query.getMany();
    }
    async createCourse(dto) {
        const course = this.courseRepository.create(dto);
        return this.courseRepository.save(course);
    }
    async updateCourse(id, dto) {
        await this.courseRepository.update(id, dto);
        return this.courseRepository.findOne({
            where: { id },
            relations: ['university', 'campus'],
        });
    }
    async removeCourse(id) {
        await this.courseRepository.delete(id);
        return { success: true };
    }
};
exports.UniversitiesService = UniversitiesService;
exports.UniversitiesService = UniversitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(university_entity_1.University)),
    __param(1, (0, typeorm_1.InjectRepository)(university_entity_1.Campus)),
    __param(2, (0, typeorm_1.InjectRepository)(university_entity_1.Course)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UniversitiesService);
//# sourceMappingURL=universities.service.js.map