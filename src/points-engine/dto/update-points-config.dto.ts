import {
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Shape of one points rule as the admin screen edits it.
 *
 * `min_value`/`max_value` describe an inclusive range and are what the AGE,
 * OVERSEAS_WORK and AUSTRALIAN_WORK categories match on. `attribute_label` is
 * what the discrete categories (ENGLISH, QUALIFICATIONS, REGIONAL_STUDY) match
 * on instead. A rule uses one or the other, never both.
 */
export class CreatePointsConfigDto {
  @ApiProperty({ description: 'Category, e.g. AGE or ENGLISH' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Points awarded when this rule matches' })
  @IsInt()
  points_value: number;

  @ApiPropertyOptional({ description: 'Visa group (defaults to GSM)' })
  @IsOptional()
  @IsString()
  visa_group?: string;

  @ApiPropertyOptional({ description: 'Optional sub-category' })
  @IsOptional()
  @IsString()
  sub_category?: string;

  @ApiPropertyOptional({
    description: 'Label matched by discrete categories, e.g. "superior"',
  })
  @IsOptional()
  @IsString()
  attribute_label?: string;

  @ApiPropertyOptional({ description: 'Inclusive lower bound for range rules' })
  @IsOptional()
  @IsInt()
  min_value?: number;

  @ApiPropertyOptional({ description: 'Inclusive upper bound for range rules' })
  @IsOptional()
  @IsInt()
  max_value?: number;

  @ApiPropertyOptional({ description: 'Whether this rule is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePointsConfigDto {
  @ApiPropertyOptional({ description: 'Points awarded when this rule matches' })
  @IsOptional()
  @IsNumber()
  points_value?: number;

  @ApiPropertyOptional({ description: 'Whether this rule is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Category, e.g. AGE or ENGLISH' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Visa group' })
  @IsOptional()
  @IsString()
  visa_group?: string;

  @ApiPropertyOptional({ description: 'Optional sub-category' })
  @IsOptional()
  @IsString()
  sub_category?: string;

  @ApiPropertyOptional({ description: 'Label matched by discrete categories' })
  @IsOptional()
  @IsString()
  attribute_label?: string;

  @ApiPropertyOptional({ description: 'Inclusive lower bound for range rules' })
  @IsOptional()
  @IsInt()
  min_value?: number;

  @ApiPropertyOptional({ description: 'Inclusive upper bound for range rules' })
  @IsOptional()
  @IsInt()
  max_value?: number;
}
