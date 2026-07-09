import { IsInt, IsOptional, IsBoolean, IsEnum, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EnglishProficiency,
  QualificationLevel,
  DEFAULT_VISA_GROUP,
} from '../constants/points-catalogue';

export class UserProfileDto {
  @ApiPropertyOptional({ description: 'Visa group', default: DEFAULT_VISA_GROUP })
  @IsString()
  @IsOptional()
  visaGroup?: string = DEFAULT_VISA_GROUP;

  @ApiProperty({ description: 'Applicant age in years', example: 29 })
  @IsInt()
  @Min(18)
  @Max(120)
  age: number;

  @ApiProperty({ description: 'English proficiency tier', enum: EnglishProficiency })
  @IsEnum(EnglishProficiency)
  englishLevel: EnglishProficiency;

  @ApiProperty({ description: 'Highest recognised qualification', enum: QualificationLevel })
  @IsEnum(QualificationLevel)
  qualification: QualificationLevel;

  @ApiProperty({ description: 'Overseas skilled work experience (years, last 10)', example: 5 })
  @IsInt()
  @Min(0)
  @Max(50)
  overseasWorkYears: number;

  @ApiProperty({ description: 'Australian skilled work experience (years, last 10)', example: 2 })
  @IsInt()
  @Min(0)
  @Max(50)
  australianWorkYears: number;

  @ApiPropertyOptional({ description: 'Completed study in a designated regional area' })
  @IsBoolean()
  @IsOptional()
  regionalStudy?: boolean;
}

export class StructuredPointsResultDto {
  @ApiProperty({ description: 'Total aggregated points' })
  totalPoints: number;

  @ApiProperty({
    description: 'Points contributed per category',
    example: {
      AGE: 30,
      ENGLISH: 20,
      QUALIFICATIONS: 15,
      OVERSEAS_WORK: 10,
      AUSTRALIAN_WORK: 5,
      WORK_EXPERIENCE_COMBINED: 15,
      REGIONAL_STUDY: 5,
    },
  })
  breakdown: Record<string, number>;

  @ApiProperty({ description: 'Whether the 20-point combined work cap was applied' })
  workCapApplied: boolean;

  @ApiProperty({ description: 'Whether the total is below the 65-point pass mark' })
  belowPassMark: boolean;

  @ApiPropertyOptional({ description: 'Reason the applicant is ineligible, if any' })
  ineligibilityReason?: string;
}
