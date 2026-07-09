import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { IntentService } from './intent.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { AdvancedSearchDto } from './dto/advanced-search.dto';
import { IntentQueryDto } from './dto/intent-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly intentService: IntentService,
  ) {}

  @Get('')
  @ApiOperation({ summary: 'Search courses and occupations' })
  @ApiQuery({
    name: 'data',
    required: false,
    description: 'Search term (course or occupation) or "all"',
  })
  async searchCoursesAndOccupations(@Query('data') data: string) {
    return this.searchService.searchCoursesAndOccupations(data);
  }

  @Get('intent')
  @ApiOperation({
    summary:
      'Smart query router: classify a raw query as SKILLED / STUDENT / FAMILY and return the matching funnel payload',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Raw user query' })
  @ApiResponse({
    status: 200,
    description:
      'Intent classification with a stream-specific payload (split-screen visas for SKILLED, course list for STUDENT, redirect for FAMILY).',
  })
  async resolveIntent(@Query() queryDto: IntentQueryDto) {
    return this.intentService.classify(queryDto.q);
  }

  @Get('occupations')
  @ApiOperation({ summary: 'Search for universities and courses' })
  async search(@Query() queryDto: SearchQueryDto) {
    return this.searchService.search(queryDto);
  }

  @Post('advanced')
  @ApiOperation({ summary: 'Advanced search with payload and filters' })
  @ApiBody({ type: AdvancedSearchDto })
  @ApiConsumes('application/json')
  @ApiResponse({ status: 200, description: 'Advanced search results' })
  async advancedSearch(@Body() body: AdvancedSearchDto & { debug?: boolean }) {
    const { page = 1, limit = 10, debug = false } = body || {};
    return this.searchService.searchAdvanced(body, page, limit, debug);
  }
}
