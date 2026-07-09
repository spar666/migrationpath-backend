import { Controller, Post, Body, Get } from '@nestjs/common';
import { VisaRecommendationService } from './visa-recommendation.service';
import { VisaRecommendationDto } from './dto/visa-recommendation.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('visa-recommendation')
@Controller('visa')
export class VisaRecommendationController {
  constructor(
    private readonly visaRecommendationService: VisaRecommendationService,
  ) {}

  @Post('recommend')
  @ApiOperation({
    summary: 'Get visa recommendations based on points and occupation (public)',
  })
  recommend(@Body() dto: VisaRecommendationDto) {
    return this.visaRecommendationService.recommend(dto.anzscoCode, dto.points);
  }

  @Get('subclasses')
  @ApiOperation({ summary: 'List all visa subclasses with metadata' })
  findAllSubclasses() {
    return [
      { id: '189', name: 'Skilled Independent' },
      { id: '190', name: 'Skilled Nominated' },
      { id: '491', name: 'Skilled Work Regional' },
    ];
  }
}
