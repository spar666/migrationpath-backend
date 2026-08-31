import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { IntentService } from './intent.service';
import { IntentQueryDto } from './dto/intent-query.dto';

/**
 * Intent routing only.
 *
 * `GET /search`, `GET /search/occupations` and `POST /search/advanced` were
 * removed with the courses module. All three iterated `Course` as the primary
 * record — a "pathway" was a course row — so there was nothing left to return
 * once the table went. None of them had a caller: the frontend searches
 * occupations through `/occupations/search` and only ever used the route below.
 */
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly intentService: IntentService) {}

  @Get('intent')
  @ApiOperation({
    summary:
      'Smart query router: classify a raw query as SKILLED / FAMILY and return the matching funnel payload',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Raw user query' })
  @ApiResponse({
    status: 200,
    description:
      'Intent classification with a stream-specific payload (split-screen visas for SKILLED, redirect for FAMILY).',
  })
  async resolveIntent(@Query() queryDto: IntentQueryDto) {
    return this.intentService.classify(queryDto.q);
  }
}
