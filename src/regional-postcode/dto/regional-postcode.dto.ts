import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsIn,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export const REGIONAL_CATEGORIES = ['METRO', 'CATEGORY_2', 'CATEGORY_3'] as const;

export class CreateRegionalBandDto {
  @ApiProperty({ example: 'Geelong' })
  @IsString()
  region: string;

  @ApiProperty({ enum: REGIONAL_CATEGORIES })
  @IsIn(REGIONAL_CATEGORIES as unknown as string[])
  category: string;

  @ApiProperty({ example: 3211 })
  @IsInt()
  @Min(200)
  @Max(9999)
  postcodeFrom: number;

  @ApiProperty({ example: 3230 })
  @IsInt()
  @Min(200)
  @Max(9999)
  postcodeTo: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sourceNote?: string;
}

export class UpdateRegionalBandDto extends PartialType(CreateRegionalBandDto) {}

export class BulkImportRegionalBandsDto {
  @ApiPropertyOptional({
    description: 'If true, deactivate all existing bands before importing',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  replaceAll?: boolean;

  @ApiProperty({ type: [CreateRegionalBandDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRegionalBandDto)
  rows: CreateRegionalBandDto[];
}
