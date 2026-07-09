import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OccupationsService } from './occupations.service';
import { CreateOccupationDto, UpdateOccupationDto } from './dto/occupation.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('occupations')
@Controller('occupations')
export class OccupationsController {
  constructor(private readonly occupationsService: OccupationsService) {}

  @Get('search')
  @ApiOperation({
    summary:
      'Advanced search with filters (q, assessing_authority, state_code)',
  })
  search(@Query() query: Record<string, unknown>) {
    return this.occupationsService.searchOccupations(query);
  }

  @Get()
  @ApiOperation({ summary: 'List with search & filters' })
  findAll(@Query() filters: Record<string, unknown>) {
    return this.occupationsService.findAll(filters);
  }

  @Get('thresholds')
  @ApiOperation({ summary: 'All thresholds for invitation tracking' })
  getThresholds() {
    return this.occupationsService.getThresholds();
  }

  @Get(':anzsco')
  @ApiOperation({
    summary:
      'Occupation detail including thresholds and the array of active eligible visas',
  })
  findOne(@Param('anzsco') anzsco: string) {
    return this.occupationsService.findOne(anzsco);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create occupation (admin)' })
  create(@Body() createOccupationDto: CreateOccupationDto) {
    return this.occupationsService.create(createOccupationDto);
  }

  @Patch(':anzsco')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update occupation by ANZSCO code (admin)' })
  update(
    @Param('anzsco') anzsco: string,
    @Body() updateOccupationDto: UpdateOccupationDto,
  ) {
    return this.occupationsService.update(anzsco, updateOccupationDto);
  }

  @Delete(':anzsco')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete occupation by ANZSCO code (admin)' })
  remove(@Param('anzsco') anzsco: string) {
    return this.occupationsService.remove(anzsco);
  }
}
