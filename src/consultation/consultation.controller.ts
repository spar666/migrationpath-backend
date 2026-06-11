import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultationService } from './consultation.service';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import { DeliverStrategyDto } from './dto/deliver-strategy.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('consultation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post('questionnaire')
  @ApiOperation({
    summary: 'Submit consultation questionnaire (authenticated)',
  })
  submitQuestionnaire(
    @User() user: AuthUser,
    @Body() dto: SubmitQuestionnaireDto,
  ) {
    return this.consultationService.submitQuestionnaire(user.id, dto.responses);
  }

  @Get('questionnaire/me')
  @ApiOperation({ summary: 'Get my latest questionnaire (authenticated)' })
  findMyQuestionnaire(@User() user: AuthUser) {
    return this.consultationService.findMyQuestionnaire(user.id);
  }

  @Get('questionnaire/user/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Get questionnaire for a specific user (admin only)' })
  findUserQuestionnaire(@Param('userId') userId: string) {
    return this.consultationService.findMyQuestionnaire(userId);
  }

  @Get('questionnaire')

  @Roles('admin')
  @ApiOperation({ summary: 'List all consultation questionnaires (admin only)' })
  findAllQuestionnaires(@Query() query: PaginationQueryDto) {
    return this.consultationService.findAllQuestionnaires(
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all consultation bookings (admin only)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.consultationService.findAllBookings(
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Patch(':id/strategy')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Deliver strategy to client (admin only)' })
  deliverStrategy(@Param('id') id: string, @Body() dto: DeliverStrategyDto) {
    return this.consultationService.deliverStrategy(id, dto.strategy);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a consultation booking (admin only)' })
  remove(@Param('id') id: string) {
    return this.consultationService.deleteBooking(id);
  }
}
