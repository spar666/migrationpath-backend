import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum VisaGroup {
  GSM = 'GSM',
  Business = 'Business',
  Criteria_Only = 'Criteria_Only',
  Relationship = 'Relationship',
  Sponsorship = 'Sponsorship',
}

export enum EnglishLevel {
  Competent = 'competent',
  Proficient = 'proficient',
  Superior = 'superior',
}

export class PointsInputDto {
  @ApiProperty({ description: 'Visa group selection', enum: VisaGroup })
  @IsString()
  visaGroup: string;

  @ApiProperty({
    description: 'Specific visa subclass (189, 190, 491, 188, etc.)',
  })
  @IsString()
  subclass: string;

  @ApiProperty({ description: 'Applicant age' })
  @IsInt()
  @Min(18)
  age: number;

  @ApiProperty({ description: 'English proficiency level', enum: EnglishLevel })
  @IsString()
  englishLevel: string;

  @ApiProperty({ description: 'Education level achieved' })
  @IsString()
  educationLevel: string;

  @ApiProperty({
    description: 'Overseas work experience in years (last 10 years)',
  })
  @IsInt()
  @Min(0)
  @Max(10)
  workExperienceOverseas: number;

  @ApiProperty({
    description: 'Australian work experience in years (last 10 years)',
  })
  @IsInt()
  @Min(0)
  @Max(10)
  workExperienceAustralia: number;

  @ApiPropertyOptional({
    description: 'Date became skilled (per skills assessment)',
  })
  @IsDateString()
  @IsOptional()
  skilledDate?: string;

  @ApiPropertyOptional({ description: 'Meets Australian study requirement' })
  @IsBoolean()
  @IsOptional()
  australianStudyRequirement?: boolean;

  @ApiPropertyOptional({ description: 'Studied in regional Australia' })
  @IsBoolean()
  @IsOptional()
  isRegional?: boolean;

  @ApiPropertyOptional({ description: 'Completed Professional Year' })
  @IsBoolean()
  @IsOptional()
  professionalYear?: boolean;

  @ApiPropertyOptional({
    description:
      'Partner skill level (single_spouse, skills_english, english_only)',
  })
  @IsString()
  @IsOptional()
  partnerSkills?: string;

  @ApiPropertyOptional({ description: 'Passed NAATI CCL' })
  @IsBoolean()
  @IsOptional()
  naati?: boolean;

  @ApiPropertyOptional({ description: 'STEM Research qualification' })
  @IsBoolean()
  @IsOptional()
  stemResearch?: boolean;
}

export class BusinessPointsInputDto {
  @ApiProperty({ description: 'Visa group (Business)' })
  @IsString()
  visaGroup: string = 'Business';

  @ApiProperty({ description: 'Business turnover in USD' })
  @IsInt()
  @Min(0)
  turnover: number;

  @ApiProperty({ description: 'Net assets in USD' })
  @IsInt()
  @Min(0)
  netAssets: number;

  @ApiPropertyOptional({ description: 'Has registered patent' })
  @IsBoolean()
  @IsOptional()
  hasPatent?: boolean;

  @ApiPropertyOptional({ description: 'Export trade business' })
  @IsBoolean()
  @IsOptional()
  exportTrade?: boolean;

  @ApiPropertyOptional({ description: 'High growth business' })
  @IsBoolean()
  @IsOptional()
  highGrowth?: boolean;
}

export class PointsResultDto {
  @ApiProperty({ description: 'Total points calculated' })
  totalPoints: number;

  @ApiProperty({ description: 'Breakdown of points by category' })
  breakdown: Record<string, number>;

  @ApiProperty({ description: 'Whether regional bonus applies' })
  regionalBonus: boolean;

  @ApiProperty({ description: 'Whether eligible for PR advantage badge' })
  prAdvantageBadge: boolean;

  @ApiProperty({ description: 'Ineligible reason if applicable' })
  ineligibilityReason?: string;

  @ApiProperty({ description: 'Whether score is below pass mark (65)' })
  belowPassMark?: boolean;
}
