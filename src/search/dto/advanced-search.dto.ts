import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SelectedOccupationDto {
  @ApiProperty({ description: 'Selected occupation label' })
  @IsString()
  occupation: string;
}

export class FiltersDto {
  @ApiPropertyOptional({ description: 'Filter by regional study eligibility' })
  @IsOptional()
  @IsBoolean()
  isRegional?: boolean;

  @ApiPropertyOptional({ description: 'Desired age points threshold' })
  @IsOptional()
  @IsNumber()
  agePoints?: number;

  @ApiPropertyOptional({ description: 'Desired english points threshold' })
  @IsOptional()
  @IsNumber()
  englishPoints?: number;

  @ApiPropertyOptional({
    description: 'Visa subclasses to include',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visaSubclasses?: string[];
}

export class AdvancedSearchDto {
  @ApiPropertyOptional({ description: 'Free text search' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Selected occupation object',
    type: SelectedOccupationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SelectedOccupationDto)
  selectedOccupation?: SelectedOccupationDto;

  @ApiPropertyOptional({ description: 'Filters object', type: FiltersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FiltersDto)
  filters?: FiltersDto;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Results per page', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}
