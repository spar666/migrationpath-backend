import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MigrationRuleService } from './migration-rule.service';
import { CreateMigrationRuleDto } from './dto/create-migration-rule.dto';
import { UpdateMigrationRuleDto } from './dto/update-migration-rule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('migration-rules')
@Controller('migration/rules')
export class MigrationRuleController {
  constructor(private readonly service: MigrationRuleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all migration rules (document requirements)' })
  @ApiQuery({
    name: 'persona_type',
    required: false,
    description: 'Optional persona type to filter by',
  })
  findAll(@Query('persona_type') persona_type?: string) {
    if (persona_type) {
      return this.service.findByPersonaType(persona_type);
    }
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a migration rule by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a migration rule (admin only)' })
  create(@Body() dto: CreateMigrationRuleDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a migration rule (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateMigrationRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a migration rule (admin only)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
