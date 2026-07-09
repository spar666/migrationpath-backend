import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RegionalPostcodeService } from './regional-postcode.service';
import {
  CreateRegionalBandDto,
  UpdateRegionalBandDto,
  BulkImportRegionalBandsDto,
} from './dto/regional-postcode.dto';

@ApiTags('admin/regional-postcodes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/regional-postcodes')
export class RegionalPostcodeController {
  constructor(private readonly service: RegionalPostcodeService) {}

  @Get()
  @ApiOperation({ summary: 'List all regional postcode bands' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a regional postcode band' })
  create(@Body() dto: CreateRegionalBandDto) {
    return this.service.create(dto);
  }

  @Post('bulk-import')
  @HttpCode(200)
  @ApiOperation({ summary: 'Bulk import regional postcode bands (CSV rows)' })
  bulkImport(@Body() dto: BulkImportRegionalBandsDto) {
    return this.service.bulkImport(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a regional postcode band' })
  update(@Param('id') id: string, @Body() dto: UpdateRegionalBandDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a regional postcode band' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
