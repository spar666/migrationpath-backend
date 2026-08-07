import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Invitation } from '../invitation/entities/invitation.entity';
import { OccupationsService } from '../occupations/occupations.service';
import { SearchQueryDto } from './dto/search-query.dto';
export interface Pathway {
    course: string;
    anzsco_code: string;
    priority: boolean;
    location_type?: string;
    age_points?: string;
    english_score?: string;
    visa_subclass?: string;
}
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
    debug?: SearchDebugInfo;
}
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
export declare class SearchService {
    private readonly courseRepository;
    private readonly invitationRepository;
    private readonly occupationsService;
    private readonly logger;
    constructor(courseRepository: Repository<Course>, invitationRepository: Repository<Invitation>, occupationsService: OccupationsService);
    private resolveOccupationName;
    searchCoursesAndOccupations(searchTerm: string): Promise<SearchResult<any[]>>;
    search(queryDto: SearchQueryDto): Promise<PaginatedSearchResult>;
    searchAdvanced(body: AdvancedSearchBody | undefined, page?: number, limit?: number, debug?: boolean): Promise<SearchResult<any[]>>;
    private matchesField;
    private applyFilters;
    private buildPathways;
    private paginate;
    private buildSummary;
}
