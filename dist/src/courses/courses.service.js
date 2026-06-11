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
const points_calculator_service_1 = require("../points-engine/points-calculator/points-calculator.service");
const points_config_repository_1 = require("../points-engine/points-config.repository");
const invitation_entity_1 = require("../invitation/entities/invitation.entity");
let CoursesService = class CoursesService {
    courseRepository;
    invitationRepository;
    pointsCalculator;
    pointsConfigRepo;
    constructor(courseRepository, invitationRepository, pointsCalculator, pointsConfigRepo) {
        this.courseRepository = courseRepository;
        this.invitationRepository = invitationRepository;
        this.pointsCalculator = pointsCalculator;
        this.pointsConfigRepo = pointsConfigRepo;
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
        const relatedInvitations = await this.invitationRepository.find({
            where: { occupation: course.anzscoTitle },
        });
        const visaNames = {
            '189': '189 Skilled Independent',
            '190': '190 State Nominated',
            '491': '491 Regional',
        };
        const visaSubclassesRaw = [
            ...new Set(relatedInvitations.map((i) => i.visa_class).filter(Boolean)),
        ];
        const visaSubclasses = visaSubclassesRaw.map((subclass) => visaNames[subclass] || subclass);
        const finalVisaSubclasses = visaSubclasses.length > 0
            ? visaSubclasses
            : ['189 Skilled Independent', '190 State Nominated', '491 Regional'];
        const qualification = this.getQualification(course.courseTitle);
        const locationType = course.isRegional ? 'Regional' : 'Metropolitan';
        let baseProfilePoints = 65;
        try {
            const configs = await this.pointsConfigRepo.findAllActive();
            const baseCfg = configs.find((c) => (c.attribute_name && c.attribute_name === 'base_profile_points') ||
                (c.category &&
                    c.category === 'defaults' &&
                    c.attribute_name === 'base_profile_points'));
            if (baseCfg && typeof baseCfg.points_value === 'number') {
                baseProfilePoints = baseCfg.points_value;
            }
        }
        catch (err) {
        }
        const estimatedPoints = baseProfilePoints + (course.isRegional ? 5 : 0);
        return {
            ...course,
            courseName: course.courseTitle,
            university: course.universityName,
            occupation: course.anzscoTitle,
            qualification,
            locationType,
            visaSubclasses: finalVisaSubclasses,
            baseProfilePoints,
            estimatedPoints,
            invitationHistory: relatedInvitations,
            roadmap: [
                {
                    step: 1,
                    label: 'Study',
                    description: 'Complete your course at an Australian institution',
                },
                {
                    step: 2,
                    label: '485 Visa',
                    description: 'Apply for post-study graduate work rights',
                },
                {
                    step: 3,
                    label: 'Skilled PR',
                    description: 'Apply for permanent residency visa',
                },
            ],
        };
    }
    async getPathwayDetails(id, query) {
        const pathway = await this.findOne(id);
        const pointsEstimate = await this.calculateDynamicPoints(id, query);
        return {
            ...pathway,
            pointsEstimate,
        };
    }
    async calculateDynamicPoints(id, query) {
        const course = await this.courseRepository.findOne({ where: { id } });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        const qualification = this.getQualification(course.courseTitle);
        let defaultEducationLevel = 'bachelors_masters';
        const qual = qualification.toLowerCase();
        if (qual.includes('master')) {
            defaultEducationLevel = 'bachelors_masters';
        }
        else if (qual.includes('doctor') || qual.includes('phd')) {
            defaultEducationLevel = 'doctoral_degree';
        }
        else if (qual.includes('diploma')) {
            defaultEducationLevel = 'diploma_trade';
        }
        const input = {
            visaGroup: query?.visaGroup || 'GSM',
            subclass: query?.subclass || '491',
            age: query?.age !== undefined ? parseInt(query.age, 10) : 25,
            englishLevel: query?.englishLevel || 'competent',
            educationLevel: query?.educationLevel || defaultEducationLevel,
            workExperienceOverseas: query?.workExperienceOverseas !== undefined
                ? parseInt(query.workExperienceOverseas, 10)
                : 0,
            workExperienceAustralia: query?.workExperienceAustralia !== undefined
                ? parseInt(query.workExperienceAustralia, 10)
                : 0,
            skilledDate: query?.skilledDate || undefined,
            australianStudyRequirement: query?.australianStudyRequirement === 'true' ||
                query?.australianStudyRequirement === true,
            isRegional: course.isRegional !== undefined
                ? !!course.isRegional
                : query?.isRegional === 'true' || query?.isRegional === true,
            professionalYear: query?.professionalYear === 'true' || query?.professionalYear === true,
            partnerSkills: query?.partnerSkills || undefined,
            naati: query?.naati === 'true' || query?.naati === true,
            stemResearch: query?.stemResearch === 'true' || query?.stemResearch === true,
        };
        try {
            return await this.pointsCalculator.calculatePoints(input);
        }
        catch (err) {
            let baseProfilePoints = 65;
            try {
                const configs = await this.pointsConfigRepo.findAllActive();
                const baseCfg = configs.find((c) => (c.attribute_name && c.attribute_name === 'base_profile_points') ||
                    (c.category &&
                        c.category === 'defaults' &&
                        c.attribute_name === 'base_profile_points'));
                if (baseCfg && typeof baseCfg.points_value === 'number') {
                    baseProfilePoints = baseCfg.points_value;
                }
            }
            catch (e) {
            }
            const totalPoints = baseProfilePoints + (course.isRegional ? 5 : 0);
            return {
                totalPoints,
                breakdown: {
                    base: baseProfilePoints,
                    regional: course.isRegional ? 5 : 0,
                },
                regionalBonus: !!course.isRegional,
                prAdvantageBadge: !!course.isRegional || totalPoints >= 90,
            };
        }
    }
    getQualification(title) {
        const t = (title || '').toLowerCase();
        if (t.includes('master'))
            return "Master's Degree";
        if (t.includes('bachelor'))
            return "Bachelor's Degree";
        if (t.includes('diploma'))
            return 'Graduate Diploma';
        return "Bachelor's Degree";
    }
    async create(dto) {
        const course = this.courseRepository.create({
            universityName: dto.universityName,
            courseTitle: dto.courseTitle,
            anzscoCode: dto.anzscoCode,
            anzscoTitle: dto.anzscoTitle,
            annualFees: dto.annualFees ?? 40000,
            duration: dto.duration ?? '2 years',
            isRegional: dto.isRegional ?? false,
            isActive: dto.isActive ?? true,
        });
        return this.courseRepository.save(course);
    }
    async update(id, dto) {
        await this.findOne(id);
        const updateData = {};
        if (dto.universityName !== undefined)
            updateData.universityName = dto.universityName;
        if (dto.courseTitle !== undefined)
            updateData.courseTitle = dto.courseTitle;
        if (dto.anzscoCode !== undefined)
            updateData.anzscoCode = dto.anzscoCode;
        if (dto.anzscoTitle !== undefined)
            updateData.anzscoTitle = dto.anzscoTitle;
        if (dto.annualFees !== undefined)
            updateData.annualFees = dto.annualFees;
        if (dto.duration !== undefined)
            updateData.duration = dto.duration;
        if (dto.isRegional !== undefined)
            updateData.isRegional = dto.isRegional;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        await this.courseRepository.update(id, updateData);
        return this.courseRepository.findOne({ where: { id } });
    }
    async remove(id) {
        await this.findOne(id);
        await this.courseRepository.delete(id);
        return { success: true };
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(1, (0, typeorm_1.InjectRepository)(invitation_entity_1.Invitation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        points_calculator_service_1.PointsCalculatorService,
        points_config_repository_1.PointsConfigRepository])
], CoursesService);
//# sourceMappingURL=courses.service.js.map