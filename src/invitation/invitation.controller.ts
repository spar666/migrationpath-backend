import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationService } from './invitation.service';
import {
  CreateInvitationDto,
  UpdateInvitationDto,
} from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get latest invitation feed (public)' })
  getFeed() {
    return this.invitationService.getFeed();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Add a new invitation entry (admin only)' })
  create(@Body() dto: CreateInvitationDto) {
    return this.invitationService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update an invitation entry (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateInvitationDto) {
    return this.invitationService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an invitation entry (admin only)' })
  remove(@Param('id') id: string) {
    return this.invitationService.remove(id);
  }
}
