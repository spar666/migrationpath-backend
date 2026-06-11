import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  courseTitle: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  campusId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  universityId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  anzscoCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  anzscoTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  annualFees?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isRegionalPointsEligible?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
