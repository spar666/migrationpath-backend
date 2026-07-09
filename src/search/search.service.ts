import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Invitation } from '../invitation/entities/invitation.entity';
import { OccupationsService } from '../occupations/occupations.service';
import { SearchQueryDto, SearchType } from './dto/search-query.dto';

export interface Pathway {
  course: string;
  anzsco_code: string;
  priority: boolean;
  location_type?: string;
  age_points?: string;
  english_score?: string;
  visa_subclass?: string;
}

export interface SearchResult<T> {
  results: T;
}

export interface PaginatedSearchResult {
  summary: string;
  results: Partial<Pathway>[];
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    // Occupation identity is resolved through the master, not Course.anzscoTitle.
    private readonly occupationsService: OccupationsService,
  ) {}

  /**
   * Canonical occupation name for a course's ANZSCO code, falling back to the
   * label stored on the course when the code isn't in the master (so no result
   * is ever dropped during consolidation).
   */
  private resolveOccupationName(
    nameMap: Record<string, string>,
    course: Course,
  ): string {
    const code = (course.anzscoCode || '').toString();
    return nameMap[code] ?? course.anzscoTitle ?? '';
  }

  async searchCoursesAndOccupations(
    searchTerm: string,
  ): Promise<SearchResult<any[]>> {
    const normalizedTerm = searchTerm ? searchTerm.toLowerCase() : '';

    const [courses, invitations, nameMap] = await Promise.all([
      this.courseRepository.find(),
      this.invitationRepository.find(),
      this.occupationsService.getCanonicalNameMap(),
    ]);

    const matchingCourses =
      !normalizedTerm || normalizedTerm === 'all'
        ? courses
        : courses.filter(
            (course) =>
              this.matchesField(course.courseTitle, normalizedTerm) ||
              this.matchesField(course.anzscoTitle, normalizedTerm),
          );

    const results = matchingCourses.map((course) => {
      const relatedInvitations = invitations.filter(
        (i) => i.occupation === course.anzscoTitle,
      );
      const visaSubclasses = [
        ...new Set(relatedInvitations.map((i) => i.visa_class).filter(Boolean)),
      ];

      return {
        id: course.id,
        courseName: course.courseTitle,
        university: (course as any).universityName || '',
        anzscoCode: course.anzscoCode,
        occupation: this.resolveOccupationName(nameMap, course),
        duration: (course as any).duration,
        qualification: (course as any).qualification || null,
        isRegional: (course as any).isRegional || false,
        visaSubclasses: visaSubclasses,
      };
    });

    return { results };
  }

  async search(queryDto: SearchQueryDto): Promise<PaginatedSearchResult> {
    const {
      q,
      type = SearchType.ALL,
      location_type,
      age_points,
      english_score,
      visa_subclass,
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
    } = queryDto;

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

  async searchAdvanced(
    body: any,
    page = 1,
    limit = 10,
    debug = false,
  ): Promise<SearchResult<any[]>> {
    const { q, selectedOccupation, filters } = body || {};
    const [allCourses, allInvitations, nameMap] = await Promise.all([
      this.courseRepository.find({}),
      this.invitationRepository.find({}),
      this.occupationsService.getCanonicalNameMap(),
    ]);
    let courses = allCourses.filter((course) => course.isActive !== false);

    if (q) {
      const term = q.toLowerCase();
      courses = courses.filter(
        (course) =>
          (course.courseTitle &&
            course.courseTitle.toLowerCase().includes(term)) ||
          (course.anzscoTitle &&
            course.anzscoTitle.toLowerCase().includes(term)) ||
          (course.anzscoCode &&
            course.anzscoCode.toString().toLowerCase().includes(term)),
      );
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
      } else {
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

        const matchesCode =
          !!anzCode &&
          (anzCode === occ || anzCode.includes(occ) || occ.includes(anzCode));
        const matchesTitle =
          !!anz && (anz === occ || anz.includes(occ) || occ.includes(anz));
        const matchesCourseTitle = !!title && title.includes(occ);

        return matchesCode || matchesTitle || matchesCourseTitle;
      });
    }

    if (filters) {
      if (filters.isRegional === true) {
        courses = courses.filter((course) => !!(course as any).isRegional);
      }
    }
    const mapped = courses
      .map((course) => {
        const relatedInvitations = allInvitations.filter(
          (i) => i.occupation === course.anzscoTitle,
        );
        const visaSubclasses = [
          ...new Set(
            relatedInvitations.map((i) => i.visa_class).filter(Boolean),
          ),
        ];

        return {
          id: course.id,
          courseName: course.courseTitle,
          university: (course as any).universityName || '',
          anzscoCode: course.anzscoCode,
          occupation: this.resolveOccupationName(nameMap, course),
          duration: (course as any).duration,
          qualification: (course as any).qualification || null,
          isRegional: !!(course as any).isRegional,
          visaSubclasses,
        };
      })
      // remove courses with no visa subclasses when a visaSubclasses filter was provided
      .filter((r) => {
        if (
          filters &&
          Array.isArray(filters.visaSubclasses) &&
          filters.visaSubclasses.length > 0
        ) {
          const courseVisa = r.visaSubclasses || [];
          // If we don't have visa subclass data for the course (empty), don't exclude it —
          // invitations were removed so visa data may be unavailable. Only filter when course has visa data.
          if (courseVisa.length === 0) return true;
          // Otherwise require at least one intersection
          return courseVisa.some((v) => filters.visaSubclasses.includes(v));
        }
        return true;
      });

    // University name is stored directly on Course now
    const results = mapped.map((m) => ({ ...m }));

    // paginate
    const start = (page - 1) * limit;
    const paged = results.slice(start, start + limit);

    if (debug) {
      return {
        results: paged,
        // @ts-ignore - attach debug info
        debug: {
          totalCandidates: allCourses.length,
          afterFilters: courses.length,
          mappedCount: mapped.length,
          sampleCourses: allCourses.slice(0, 5).map((c) => ({
            id: c.id,
            courseTitle: c.courseTitle,
            anzscoTitle: c.anzscoTitle,
            universityName: (c as any).universityName,
          })),
        },
      } as any;
    }

    return { results: paged };
  }

  private matchesField(field: string | undefined, term: string): boolean {
    return !!field && field.toLowerCase().includes(term);
  }

  private applyFilters(
    pathways: Pathway[],
    filters: {
      q?: string;
      type?: SearchType;
      location_type?: string;
      age_points?: string;
      english_score?: string;
      visa_subclass?: string;
    },
  ): Pathway[] {
    let filtered = [...pathways];
    const { q, location_type, age_points, english_score, visa_subclass } =
      filters;

    if (location_type) {
      filtered = filtered.filter(
        (p) => p.location_type?.toLowerCase() === location_type.toLowerCase(),
      );
    }

    if (age_points) {
      filtered = filtered.filter((p) => p.age_points === age_points);
    }

    if (english_score) {
      filtered = filtered.filter(
        (p) => p.english_score?.toLowerCase() === english_score.toLowerCase(),
      );
    }

    if (visa_subclass) {
      filtered = filtered.filter(
        (p) => p.visa_subclass?.toLowerCase() === visa_subclass.toLowerCase(),
      );
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

  private buildPathways(
    courses: Course[],
    invitations: Invitation[],
  ): Pathway[] {
    return courses.map((course) => {
      const relatedInvitation = invitations.find(
        (i) => i.occupation === course.anzscoTitle,
      );

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

  private paginate<T>(items: T[], page: number, limit: number): T[] {
    const startIndex = (page - 1) * limit;
    return items.slice(startIndex, startIndex + limit);
  }

  private buildSummary(count: number): string {
    return `${count} ${count === 1 ? 'Pathway' : 'Pathways'} Found`;
  }
}
