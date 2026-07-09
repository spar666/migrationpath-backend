import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OccupationsService } from './occupations.service';
import { OccupationListImportService } from './occupation-list-import.service';
import { SyncVisasDto } from './dto/sync-visas.dto';
import { ImportOccupationListsDto } from './dto/import-occupation-lists.dto';

/**
 * Combined with the global 'api/v1' prefix:
 *   POST /api/v1/admin/occupations/sync-visas
 *   POST /api/v1/admin/occupations/import-lists
 */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/occupations')
export class OccupationsAdminController {
  constructor(
    private readonly occupationsService: OccupationsService,
    private readonly listImportService: OccupationListImportService,
  ) {}

  @Post('sync-visas')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Bulk resolve/update occupation<->visa links from the legislative matrix (admin)',
  })
  syncVisas(@Body() dto: SyncVisasDto) {
    return this.occupationsService.syncVisas(dto);
  }

  @Post('import-lists')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Bulk import skilled-list membership (MLTSSL/STSOL/ROL/CSOL) by ANZSCO code (admin)',
  })
  importLists(@Body() dto: ImportOccupationListsDto) {
    return this.listImportService.importLists(dto);
  }
}
