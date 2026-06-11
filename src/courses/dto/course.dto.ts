import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'University of Melbourne' })
  @IsString()
  universityName: string;

  @ApiProperty({ example: 'Master of Information Technology' })
  @IsString()
  courseTitle: string;

  @ApiPropertyOptional({ example: '261313' })
  @IsString()
  @IsOptional()
  anzscoCode?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsString()
  @IsOptional()
  anzscoTitle?: string;

  @ApiPropertyOptional({ example: 40000 })
  @IsNumber()
  @IsOptional()
  annualFees?: number;

  @ApiPropertyOptional({ example: '2 years' })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isRegional?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
