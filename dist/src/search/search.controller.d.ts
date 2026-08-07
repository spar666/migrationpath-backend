import { SearchService } from './search.service';
import { IntentService } from './intent.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { AdvancedSearchDto } from './dto/advanced-search.dto';
import { IntentQueryDto } from './dto/intent-query.dto';
export declare class SearchController {
    private readonly searchService;
    private readonly intentService;
    constructor(searchService: SearchService, intentService: IntentService);
    searchCoursesAndOccupations(data: string): Promise<import("./search.service").SearchResult<any[]>>;
    resolveIntent(queryDto: IntentQueryDto): Promise<import("./intent.service").IntentResult>;
    search(queryDto: SearchQueryDto): Promise<import("./search.service").PaginatedSearchResult>;
    advancedSearch(body: AdvancedSearchDto & {
        debug?: boolean;
    }): Promise<import("./search.service").SearchResult<any[]>>;
}
