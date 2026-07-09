import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, MinLength } from 'class-validator';

export enum SearchType {
  COURSE = 'course',
  OCCUPATION = 'occupation',
  ALL = 'all',
}

export class SearchQueryDto {
  @ApiPropertyOptional({ description: 'Search query string', minLength: 2 })
  @IsString()
  @MinLength(2)
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ enum: SearchType, default: SearchType.ALL })
  @IsEnum(SearchType)
  @IsOptional()
  type?: SearchType = SearchType.ALL;

  @ApiPropertyOptional({
    description: 'Filter by exact or partial occupation name',
  })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional({
    description: 'Filter by exact or partial course name',
  })
  @IsString()
  @IsOptional()
  course?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by location type' })
  @IsString()
  @IsOptional()
  location_type?: string;

  @ApiPropertyOptional({ description: 'Filter by age points' })
  @IsString()
  @IsOptional()
  age_points?: string;

  @ApiPropertyOptional({ description: 'Filter by english score' })
  @IsString()
  @IsOptional()
  english_score?: string;

  @ApiPropertyOptional({ description: 'Filter by visa subclass' })
  @IsString()
  @IsOptional()
  visa_subclass?: string;
}
