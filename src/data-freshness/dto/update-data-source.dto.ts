import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDataSourceDto {
  @ApiPropertyOptional({ description: 'Review cadence in days' })
  @IsInt()
  @Min(1)
  @Max(1825)
  @IsOptional()
  reviewIntervalDays?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
