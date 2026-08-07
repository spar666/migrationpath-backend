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

/**
 * The advanced-search request body.
 *
 * `selectedOccupation` is a union because the frontend has sent it three ways
 * over time — a bare string, and objects keyed on `occupation`, `value`,
 * `label` or `title` depending on which picker produced it. Typing it as `any`
 * hid that history; naming it means the next person can see what has to keep
 * working and can delete a shape once nothing sends it.
 */
export interface AdvancedSearchBody {
  q?: string;
  selectedOccupation?: string | SelectedOccupation;
  filters?: AdvancedSearchFilters;
}

export interface SelectedOccupation {
  occupation?: string;
  value?: string;
  label?: string;
  title?: string;
}

export interface AdvancedSearchFilters {
  isRegional?: boolean;
  visaSubclasses?: string[];
}

export interface SearchResult<T> {
  results: T;
  /**
   * Only present when the caller passes `debug`. Declared rather than attached
   * behind a `@ts-ignore`: a field the compiler cannot see is a field no caller
   * can safely read, and one nobody will remember to remove.
   */
  debug?: SearchDebugInfo;
}

/** Counts at each stage of the filter chain, for diagnosing an empty result. */
export interface SearchDebugInfo {
  totalCandidates: number;
  afterFilters: number;
  mappedCount: number;
  sampleCourses: {
    id: string;
    courseTitle: string;
    anzscoTitle: string;
    universityName: string;
  }[];
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
        university: course.universityName || '',
        anzscoCode: course.anzscoCode,
        occupation: this.resolveOccupationName(nameMap, course),
        isRegional: course.isRegional || false,
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
    body: AdvancedSearchBody | undefined,
    page = 1,
    limit = 10,
    debug = false,
  ): Promise<SearchResult<any[]>> {
    const { q, selectedOccupation, filters } = body ?? {};
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

    const selectedOccRaw =
      typeof selectedOccupation === 'string'
        ? selectedOccupation
        : (selectedOccupation?.occupation ??
          selectedOccupation?.value ??
          selectedOccupation?.label ??
          selectedOccupation?.title ??
          '');

    const selectedOcc = selectedOccRaw.trim().toLowerCase();

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
        courses = courses.filter((course) => course.isRegional);
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
          university: course.universityName || '',
          anzscoCode: course.anzscoCode,
          occupation: this.resolveOccupationName(nameMap, course),
          isRegional: course.isRegional,
          visaSubclasses,
        };
      })
      // Drop courses that do not match the requested visa subclasses.
      .filter((result) => {
        // Hoisted so TypeScript keeps the narrowing inside the callback —
        // reading filters.visaSubclasses again there would be possibly-undefined.
        const wanted = filters?.visaSubclasses ?? [];
        if (wanted.length === 0) return true;

        // A course with NO visa data is kept rather than excluded: invitations
        // were removed from some datasets, so an empty list means "unknown",
        // not "matches nothing". Filtering only bites where we have data.
        const courseVisa = result.visaSubclasses;
        if (courseVisa.length === 0) return true;

        return courseVisa.some((subclass) => wanted.includes(subclass));
      });

    // University name is stored directly on Course now
    const results = mapped.map((m) => ({ ...m }));

    // paginate
    const start = (page - 1) * limit;
    const paged = results.slice(start, start + limit);

    if (debug) {
      // Declared on the return type rather than smuggled past the compiler
      // with @ts-ignore + `as any`. The suppression hid the shape from every
      // caller, so nothing downstream could see the field it was adding.
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
