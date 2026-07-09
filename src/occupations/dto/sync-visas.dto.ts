import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SyncVisasDto {
  /**
   * Restrict the sync to specific occupations by ANZSCO code. When omitted, the
   * sync runs across every occupation that has a classified primary_list.
   */
  @ApiPropertyOptional({
    type: [String],
    description: 'Optional subset of ANZSCO codes to sync. Omit to sync all.',
    example: ['261313', '221111'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  anzscoCodes?: string[];

  /**
   * When true (default), links that no longer match the matrix are deactivated
   * (is_active = false) rather than left stale. Set false to only add/refresh.
   */
  @ApiPropertyOptional({
    default: true,
    description:
      'Deactivate links that are no longer valid under the current matrix.',
  })
  @IsBoolean()
  @IsOptional()
  deactivateStale?: boolean;
}
