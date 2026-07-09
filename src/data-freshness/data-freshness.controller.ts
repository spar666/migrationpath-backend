import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DataFreshnessService } from './data-freshness.service';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@ApiTags('admin/data-freshness')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/data-freshness')
export class DataFreshnessController {
  constructor(private readonly service: DataFreshnessService) {}

  @Get()
  @ApiOperation({ summary: 'Freshness status of each legislative data domain' })
  findAll() {
    return this.service.findAll();
  }

  @Post(':domain/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark a domain as verified as of now' })
  verify(@Param('domain') domain: string) {
    return this.service.markVerified(domain);
  }

  @Put(':domain')
  @ApiOperation({ summary: 'Update a domain review cadence / source / notes' })
  update(@Param('domain') domain: string, @Body() dto: UpdateDataSourceDto) {
    return this.service.update(domain, dto);
  }
}
