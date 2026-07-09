import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import {
  FaqQueryDto,
  GuideQueryDto,
  NewsArticleQueryDto,
  CmsPaginationDto,
} from './dto/cms-query.dto';

@ApiTags('cms')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check Strapi CMS connection status' })
  health() {
    return this.cmsService.health();
  }

  @Get('banners')
  @ApiOperation({ summary: 'List all banners from CMS' })
  getBanners(@Query() query: CmsPaginationDto) {
    return this.cmsService.getBanners(query);
  }

  @Get('banners/:id')
  @ApiOperation({ summary: 'Get a single banner by ID' })
  getBanner(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.getBanner(id);
  }

  @Get('faqs')
  @ApiOperation({ summary: 'List FAQs with optional category/persona filters' })
  getFaqs(@Query() query: FaqQueryDto) {
    const params: Record<string, any> = {};
    if (query.page) params['pagination[page]'] = query.page;
    if (query.pageSize) params['pagination[pageSize]'] = query.pageSize;
    if (query.category) params['filters[category][$eq]'] = query.category;
    if (query.persona) params['filters[persona][$eq]'] = query.persona;
    return this.cmsService.getFaqs(params);
  }

  @Get('faqs/:id')
  @ApiOperation({ summary: 'Get a single FAQ by ID' })
  getFaq(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.getFaq(id);
  }

  @Get('guides')
  @ApiOperation({ summary: 'List guides with optional filters' })
  getGuides(@Query() query: GuideQueryDto) {
    const params: Record<string, any> = {};
    if (query.page) params['pagination[page]'] = query.page;
    if (query.pageSize) params['pagination[pageSize]'] = query.pageSize;
    if (query.category) params['filters[category][$eq]'] = query.category;
    if (query.persona) params['filters[persona][$eq]'] = query.persona;
    if (query.difficulty) params['filters[difficulty][$eq]'] = query.difficulty;
    return this.cmsService.getGuides(params);
  }

  @Get('guides/:id')
  @ApiOperation({ summary: 'Get a single guide by ID' })
  getGuide(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.getGuide(id);
  }

  @Get('news-articles')
  @ApiOperation({ summary: 'List news articles with optional filters' })
  getNewsArticles(@Query() query: NewsArticleQueryDto) {
    const params: Record<string, any> = {};
    if (query.page) params['pagination[page]'] = query.page;
    if (query.pageSize) params['pagination[pageSize]'] = query.pageSize;
    if (query.category) params['filters[category][$eq]'] = query.category;
    if (query.target_persona)
      params['filters[target_persona][$eq]'] = query.target_persona;
    return this.cmsService.getNewsArticles(params);
  }

  @Get('news-articles/slug/:slug')
  @ApiOperation({ summary: 'Get a single news article by slug' })
  getNewsArticleBySlug(@Param('slug') slug: string) {
    return this.cmsService.getNewsArticleBySlug(slug);
  }

  @Get('news-articles/:id')
  @ApiOperation({ summary: 'Get a single news article by ID' })
  getNewsArticle(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.getNewsArticle(id);
  }

  @Get('success-stories')
  @ApiOperation({ summary: 'List success stories from CMS' })
  getSuccessStories(@Query() query: CmsPaginationDto) {
    return this.cmsService.getSuccessStories(query);
  }

  @Get('success-stories/:id')
  @ApiOperation({ summary: 'Get a single success story by ID' })
  getSuccessStory(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.getSuccessStory(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all categories from CMS' })
  getCategories(@Query() query: CmsPaginationDto) {
    return this.cmsService.getCategories(query);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a single category by ID' })
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.getCategory(id);
  }
}
