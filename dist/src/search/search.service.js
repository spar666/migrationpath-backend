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
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("../courses/entities/course.entity");
const invitation_entity_1 = require("../invitation/entities/invitation.entity");
const occupations_service_1 = require("../occupations/occupations.service");
const search_query_dto_1 = require("./dto/search-query.dto");
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
let SearchService = SearchService_1 = class SearchService {
    courseRepository;
    invitationRepository;
    occupationsService;
    logger = new common_1.Logger(SearchService_1.name);
    constructor(courseRepository, invitationRepository, occupationsService) {
        this.courseRepository = courseRepository;
        this.invitationRepository = invitationRepository;
        this.occupationsService = occupationsService;
    }
    resolveOccupationName(nameMap, course) {
        const code = (course.anzscoCode || '').toString();
        return nameMap[code] ?? course.anzscoTitle ?? '';
    }
    async searchCoursesAndOccupations(searchTerm) {
        const normalizedTerm = searchTerm ? searchTerm.toLowerCase() : '';
        const [courses, invitations, nameMap] = await Promise.all([
            this.courseRepository.find(),
            this.invitationRepository.find(),
            this.occupationsService.getCanonicalNameMap(),
        ]);
        const matchingCourses = !normalizedTerm || normalizedTerm === 'all'
            ? courses
            : courses.filter((course) => this.matchesField(course.courseTitle, normalizedTerm) ||
                this.matchesField(course.anzscoTitle, normalizedTerm));
        const results = matchingCourses.map((course) => {
            const relatedInvitations = invitations.filter((i) => i.occupation === course.anzscoTitle);
            const visaSubclasses = [
                ...new Set(relatedInvitations.map((i) => i.visa_class).filter(Boolean)),
            ];
            return {
                id: course.id,
                courseName: course.courseTitle,
                university: course.universityName || '',
                anzscoCode: course.anzscoCode,
                occupation: this.resolveOccupationName(nameMap, course),
                duration: course.duration,
                qualification: course.qualification || null,
                isRegional: course.isRegional || false,
                visaSubclasses: visaSubclasses,
            };
        });
        return { results };
    }
    async search(queryDto) {
        const { q, type = search_query_dto_1.SearchType.ALL, location_type, age_points, english_score, visa_subclass, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, } = queryDto;
        const [courses, invitations] = await Promise.all([
            this.courseRepository.find(),
            this.invitationRepository.find(),
        ]);
        let pathways = this.buildPathways(courses, invitations);
        pathways = this.applyFilters(pathways, {
            q,
            type,
            location_type,
            age_points,
            english_score,
            visa_subclass,
        });
        const paginatedResults = this.paginate(pathways, page, limit);
        const summary = this.buildSummary(pathways.length);
        return { summary, results: paginatedResults };
    }
    async searchAdvanced(body, page = 1, limit = 10, debug = false) {
        const { q, selectedOccupation, filters } = body || {};
        const [allCourses, allInvitations, nameMap] = await Promise.all([
            this.courseRepository.find({}),
            this.invitationRepository.find({}),
            this.occupationsService.getCanonicalNameMap(),
        ]);
        let courses = allCourses.filter((course) => course.isActive !== false);
        if (q) {
            const term = q.toLowerCase();
            courses = courses.filter((course) => (course.courseTitle &&
                course.courseTitle.toLowerCase().includes(term)) ||
                (course.anzscoTitle &&
                    course.anzscoTitle.toLowerCase().includes(term)) ||
                (course.anzscoCode &&
                    course.anzscoCode.toString().toLowerCase().includes(term)));
        }
        let selectedOccRaw = '';
        if (selectedOccupation) {
            if (typeof selectedOccupation === 'object') {
                selectedOccRaw =
                    selectedOccupation.occupation ||
                        selectedOccupation.value ||
                        selectedOccupation.label ||
                        selectedOccupation.title ||
                        '';
            }
            else {
                selectedOccRaw = selectedOccupation;
            }
        }
        const selectedOcc = (selectedOccRaw || '').toString().trim().toLowerCase();
        if (selectedOcc) {
            const occ = selectedOcc;
            courses = courses.filter((course) => {
                const anzCode = (course.anzscoCode || '').toString().toLowerCase();
                const anz = (course.anzscoTitle || '').toLowerCase();
                const title = (course.courseTitle || '').toLowerCase();
                const matchesCode = !!anzCode &&
                    (anzCode === occ || anzCode.includes(occ) || occ.includes(anzCode));
                const matchesTitle = !!anz && (anz === occ || anz.includes(occ) || occ.includes(anz));
                const matchesCourseTitle = !!title && title.includes(occ);
                return matchesCode || matchesTitle || matchesCourseTitle;
            });
        }
        if (filters) {
            if (filters.isRegional === true) {
                courses = courses.filter((course) => !!course.isRegional);
            }
        }
        const mapped = courses
            .map((course) => {
            const relatedInvitations = allInvitations.filter((i) => i.occupation === course.anzscoTitle);
            const visaSubclasses = [
                ...new Set(relatedInvitations.map((i) => i.visa_class).filter(Boolean)),
            ];
            return {
                id: course.id,
                courseName: course.courseTitle,
                university: course.universityName || '',
                anzscoCode: course.anzscoCode,
                occupation: this.resolveOccupationName(nameMap, course),
                duration: course.duration,
                qualification: course.qualification || null,
                isRegional: !!course.isRegional,
                visaSubclasses,
            };
        })
            .filter((r) => {
            if (filters &&
                Array.isArray(filters.visaSubclasses) &&
                filters.visaSubclasses.length > 0) {
                const courseVisa = r.visaSubclasses || [];
                if (courseVisa.length === 0)
                    return true;
                return courseVisa.some((v) => filters.visaSubclasses.includes(v));
            }
            return true;
        });
        const results = mapped.map((m) => ({ ...m }));
        const start = (page - 1) * limit;
        const paged = results.slice(start, start + limit);
        if (debug) {
            return {
                results: paged,
                debug: {
                    totalCandidates: allCourses.length,
                    afterFilters: courses.length,
                    mappedCount: mapped.length,
                    sampleCourses: allCourses.slice(0, 5).map((c) => ({
                        id: c.id,
                        courseTitle: c.courseTitle,
                        anzscoTitle: c.anzscoTitle,
                        universityName: c.universityName,
                    })),
                },
            };
        }
        return { results: paged };
    }
    matchesField(field, term) {
        return !!field && field.toLowerCase().includes(term);
    }
    applyFilters(pathways, filters) {
        let filtered = [...pathways];
        const { q, location_type, age_points, english_score, visa_subclass } = filters;
        if (location_type) {
            filtered = filtered.filter((p) => p.location_type?.toLowerCase() === location_type.toLowerCase());
        }
        if (age_points) {
            filtered = filtered.filter((p) => p.age_points === age_points);
        }
        if (english_score) {
            filtered = filtered.filter((p) => p.english_score?.toLowerCase() === english_score.toLowerCase());
        }
        if (visa_subclass) {
            filtered = filtered.filter((p) => p.visa_subclass?.toLowerCase() === visa_subclass.toLowerCase());
        }
        if (q) {
            const terms = q.toLowerCase().split(' ');
            filtered = filtered.filter((p) => {
                const searchString = `${p.course} ${p.anzsco_code}`.toLowerCase();
                return terms.every((term) => searchString.includes(term));
            });
        }
        return filtered;
    }
    buildPathways(courses, invitations) {
        return courses.map((course) => {
            const relatedInvitation = invitations.find((i) => i.occupation === course.anzscoTitle);
            return {
                course: course.courseTitle,
                anzsco_code: course.anzscoCode || '',
                priority: relatedInvitation?.priority ?? false,
                location_type: 'Unknown',
                age_points: relatedInvitation?.points?.toString(),
                english_score: 'Unknown',
                visa_subclass: relatedInvitation?.visa_class,
            };
        });
    }
    paginate(items, page, limit) {
        const startIndex = (page - 1) * limit;
        return items.slice(startIndex, startIndex + limit);
    }
    buildSummary(count) {
        return `${count} ${count === 1 ? 'Pathway' : 'Pathways'} Found`;
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(1, (0, typeorm_1.InjectRepository)(invitation_entity_1.Invitation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        occupations_service_1.OccupationsService])
], SearchService);
//# sourceMappingURL=search.service.js.map