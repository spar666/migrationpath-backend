import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePolicyConfigDto {
  @ApiPropertyOptional({ description: 'New numeric value' })
  @IsNumber()
  @IsOptional()
  numericValue?: number;

  @ApiPropertyOptional({ description: 'Cross-check source (instrument name / URL / note)' })
  @IsString()
  @IsOptional()
  sourceNote?: string;

  @ApiPropertyOptional({ description: 'Effective date (ISO yyyy-mm-dd)' })
  @IsDateString()
  @IsOptional()
  effectiveDate?: string;
}
