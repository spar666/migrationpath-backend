import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserProgressService } from './user-progress.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('user-progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me/progress')
export class UserProgressController {
  constructor(private readonly progressService: UserProgressService) {}

  // ─── GET all ────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Get all my saved progress records' })
  getMyProgress(@User() user: AuthUser) {
    return this.progressService.getMyProgress(user.id);
  }

  // ─── GET one ────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Get a single saved progress record by ID' })
  getOne(@User() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.progressService.getOne(user.id, id);
  }

  // ─── POST (save from search / view-details) ─────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Save a new progress record (from search or view-details page)',
  })
  create(@User() user: AuthUser, @Body() dto: SaveProgressDto) {
    return this.progressService.create(user.id, dto);
  }

  // ─── PATCH (advance step / add calculator result) ───────────────────────────
  @Patch(':id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({
    summary: 'Update a progress record (advance step, save calculator points)',
  })
  update(
    @User() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.progressService.update(user.id, id, dto);
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────────
  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Delete a saved progress record' })
  remove(@User() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.progressService.remove(user.id, id);
  }
}
