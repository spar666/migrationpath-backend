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
var IntentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("../courses/entities/course.entity");
const occupations_service_1 = require("../occupations/occupations.service");
const POINTS_TESTED_SUBCLASSES = new Set(['189', '190', '491', '485']);
const EMPLOYER_SPONSORED_SUBCLASSES = new Set(['482', '186', '494']);
const RELATIONSHIP_KEYWORDS = [
    'partner',
    'spouse',
    'married',
    'marriage',
    'de facto',
    'parent',
    'family',
    'fiance',
    'fiancé',
];
const FAMILY_REDIRECT = '/pathways/partner';
const AUDIT_REDIRECT = '/pathways/onshore';
const STUDENT_COURSE_LIMIT = 12;
let IntentService = IntentService_1 = class IntentService {
    occupationsService;
    courseRepository;
    logger = new common_1.Logger(IntentService_1.name);
    constructor(occupationsService, courseRepository) {
        this.occupationsService = occupationsService;
        this.courseRepository = courseRepository;
    }
    async classify(rawQuery) {
        const query = (rawQuery ?? '').trim();
        const lower = query.toLowerCase();
        if (/^\d{6}$/.test(query)) {
            const skilled = await this.resolveSkilled(query, query);
            if (skilled)
                return skilled;
        }
        const matchedKeyword = this.matchRelationshipKeyword(lower);
        if (matchedKeyword) {
            return {
                intent: 'FAMILY',
                query,
                matchedKeyword,
                redirectTo: FAMILY_REDIRECT,
            };
        }
        const occupationMatch = await this.findOccupationByTitle(query);
        if (occupationMatch) {
            const skilled = await this.resolveSkilled(occupationMatch.anzsco_code, query);
            if (skilled)
                return skilled;
        }
        const courses = await this.findCourses(query);
        if (courses.length > 0) {
            return { intent: 'STUDENT', query, courses };
        }
        return {
            intent: 'UNKNOWN',
            query,
            suggestAudit: true,
            redirectTo: AUDIT_REDIRECT,
        };
    }
    matchRelationshipKeyword(lowerQuery) {
        for (const keyword of RELATIONSHIP_KEYWORDS) {
            const pattern = new RegExp(`(^|\\W)${this.escapeRegex(keyword)}(\\W|$)`);
            if (pattern.test(lowerQuery))
                return keyword;
        }
        return null;
    }
    async findOccupationByTitle(query) {
        const { data } = await this.occupationsService.searchOccupations({
            q: query,
            page: 1,
            limit: 1,
        });
        if (Array.isArray(data) && data.length > 0 && data[0]?.anzsco_code) {
            return { anzsco_code: data[0].anzsco_code };
        }
        return null;
    }
    async resolveSkilled(anzscoCode, query) {
        try {
            const occupation = await this.occupationsService.findOne(anzscoCode);
            const pointsTested = occupation.eligibleVisas.filter((v) => POINTS_TESTED_SUBCLASSES.has(v.subclassNumber));
            const employerSponsored = occupation.eligibleVisas.filter((v) => EMPLOYER_SPONSORED_SUBCLASSES.has(v.subclassNumber));
            return {
                intent: 'SKILLED',
                query,
                occupation: {
                    anzscoCode: occupation.anzsco_code,
                    title: occupation.occupation_name,
                    primaryList: occupation.primary_list,
                    assessingAuthority: occupation.assessing_authority,
                },
                pointsTested,
                employerSponsored,
            };
        }
        catch (error) {
            this.logger.warn(`resolveSkilled: occupation "${anzscoCode}" not resolvable (${error.message})`);
            return null;
        }
    }
    async findCourses(query) {
        const like = `%${query.toLowerCase()}%`;
        const rows = await this.courseRepository
            .createQueryBuilder('course')
            .where('course.isActive = :active', { active: true })
            .andWhere('(LOWER(course.courseTitle) LIKE :like OR LOWER(course.universityName) LIKE :like OR LOWER(course.anzscoTitle) LIKE :like)', { like })
            .orderBy('course.courseTitle', 'ASC')
            .take(STUDENT_COURSE_LIMIT)
            .getMany();
        return rows.map((course) => ({
            id: course.id,
            courseName: course.courseTitle,
            university: course.universityName,
            isRegional: course.isRegional,
            anzscoCode: course.anzscoCode ?? null,
            occupation: course.anzscoTitle ?? null,
        }));
    }
    escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};
exports.IntentService = IntentService;
exports.IntentService = IntentService = IntentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __metadata("design:paramtypes", [occupations_service_1.OccupationsService,
        typeorm_2.Repository])
], IntentService);
//# sourceMappingURL=intent.service.js.map