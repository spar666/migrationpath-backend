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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("./entities/course.entity");
const postcode_validator_service_1 = require("../postcode/postcode-validator.service");
const occupations_service_1 = require("../occupations/occupations.service");
let CoursesService = class CoursesService {
    courseRepository;
    postcodeValidator;
    occupationsService;
    constructor(courseRepository, postcodeValidator, occupationsService) {
        this.courseRepository = courseRepository;
        this.postcodeValidator = postcodeValidator;
        this.occupationsService = occupationsService;
    }
    async findAll(filters) {
        const query = this.courseRepository.createQueryBuilder('course');
        if (filters?.universityName) {
            query.andWhere('course.universityName ILIKE :universityName', {
                universityName: `%${filters.universityName}%`,
            });
        }
        if (filters?.anzscoCode) {
            query.andWhere('course.anzscoCode = :anzscoCode', {
                anzscoCode: filters.anzscoCode,
            });
        }
        if (filters?.isActive !== undefined) {
            query.andWhere('course.isActive = :isActive', {
                isActive: filters.isActive,
            });
        }
        query
            .orderBy('course.universityName', 'ASC')
            .addOrderBy('course.courseTitle', 'ASC');
        return query.getMany();
    }
    async findOne(id) {
        const course = await this.courseRepository.findOne({ where: { id } });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        const eligibleVisas = course.anzscoCode
            ? await this.occupationsService.getEligibleVisas(course.anzscoCode)
            : [];
        return {
            ...course,
            courseName: course.courseTitle,
            university: course.universityName,
            occupation: course.anzscoTitle,
            locationType: course.isRegional ? 'Regional' : 'Metropolitan',
            regionalPoints: course.isRegional ? 5 : 0,
            eligibleVisas,
            visaSubclasses: eligibleVisas.map((v) => v.subclassNumber),
        };
    }
    async create(dto) {
        const course = this.courseRepository.create({
            universityName: dto.universityName,
            courseTitle: dto.courseTitle,
            anzscoCode: dto.anzscoCode,
            anzscoTitle: (await this.resolveOccupationTitle(dto.anzscoCode)) ?? undefined,
            isActive: dto.isActive ?? true,
        });
        this.applyRegionalClassification(course, dto.campusPostcode);
        return this.courseRepository.save(course);
    }
    async update(id, dto) {
        const existing = await this.courseRepository.findOne({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        const updateData = {};
        if (dto.universityName !== undefined)
            updateData.universityName = dto.universityName;
        if (dto.courseTitle !== undefined)
            updateData.courseTitle = dto.courseTitle;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        if (dto.anzscoCode !== undefined) {
            updateData.anzscoCode = dto.anzscoCode;
            updateData.anzscoTitle =
                (await this.resolveOccupationTitle(dto.anzscoCode)) ?? undefined;
        }
        if (dto.campusPostcode !== undefined) {
            this.applyRegionalClassification(updateData, dto.campusPostcode);
        }
        await this.courseRepository.update(id, updateData);
        return this.courseRepository.findOne({ where: { id } });
    }
    async remove(id) {
        const result = await this.courseRepository.delete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        return { success: true };
    }
    async resolveOccupationTitle(anzscoCode) {
        if (!anzscoCode)
            return null;
        const map = await this.occupationsService.getCanonicalNameMap([anzscoCode]);
        return map[anzscoCode] ?? null;
    }
    applyRegionalClassification(course, campusPostcode) {
        const classification = this.postcodeValidator.validate(campusPostcode);
        course.campusPostcode = campusPostcode ? classification.postcode : null;
        course.isRegional = classification.isRegional;
        course.regionalCategory = classification.category;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        postcode_validator_service_1.PostcodeValidatorService,
        occupations_service_1.OccupationsService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map