import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

/**
 * Lean course payload. The course/university surface is intentionally minimal:
 * it exists to link a study option to an occupation (anzscoCode) and to carry
 * the regional point signal (campusPostcode). Tuition, duration, and a manual
 * occupation title are no longer captured — the occupation name is resolved
 * from the occupations master by anzscoCode, and regional status is derived
 * server-side from the postcode.
 */
export class CreateCourseDto {
  @ApiProperty({ example: 'University of Melbourne' })
  @IsString()
  universityName: string;

  @ApiProperty({ example: 'Master of Information Technology' })
  @IsString()
  courseTitle: string;

  @ApiPropertyOptional({ example: '261313', description: 'Links the course to an occupation in the master' })
  @IsString()
  @IsOptional()
  anzscoCode?: string;

  @ApiPropertyOptional({ example: '3220', description: '4-digit campus postcode (drives regional +5)' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{3,4}$/, { message: 'campusPostcode must be a 3-4 digit postcode' })
  campusPostcode?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
