import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PolicyConfigService } from './policy-config.service';
import { UpdatePolicyConfigDto } from './dto/update-policy-config.dto';

@ApiTags('admin/policy-config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/policy-config')
export class PolicyConfigController {
  constructor(private readonly policyConfigService: PolicyConfigService) {}

  @Get()
  @ApiOperation({ summary: 'List all admin-editable legislative constants' })
  findAll() {
    return this.policyConfigService.findAll();
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update a legislative constant (value / source / effective date)' })
  update(@Param('key') key: string, @Body() dto: UpdatePolicyConfigDto) {
    return this.policyConfigService.update(key, dto);
  }
}
