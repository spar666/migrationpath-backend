import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { AdvancedSearchDto } from './dto/advanced-search.dto';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    searchCoursesAndOccupations(data: string): Promise<import("./search.service").SearchResult<any[]>>;
    search(queryDto: SearchQueryDto): Promise<import("./search.service").PaginatedSearchResult>;
    advancedSearch(body: AdvancedSearchDto & {
        debug?: boolean;
    }): Promise<import("./search.service").SearchResult<any[]>>;
}
