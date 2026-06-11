import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import type { ProgressStep } from '../entities/user-progress.entity';

export class SaveProgressDto {
  @ApiPropertyOptional({
    description:
      'A user-friendly label for this saved progress, e.g. "My 189 Pathway"',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Current step in the journey',
    enum: [
      'search',
      'view_details',
      'points_calculator',
      'visa_recommendation',
      'completed',
    ],
  })
  @IsOptional()
  @IsString()
  current_step?: ProgressStep;

  @ApiPropertyOptional({
    description: 'ANZSCO occupation code being researched',
  })
  @IsOptional()
  @IsString()
  anzsco_code?: string;

  @ApiPropertyOptional({ description: 'Target visa subclass, e.g. "189"' })
  @IsOptional()
  @IsString()
  target_visa?: string;

  @ApiPropertyOptional({ description: 'Cached points score from calculator' })
  @IsOptional()
  @IsInt()
  calculated_points?: number;

  @ApiProperty({
    description:
      'Flexible JSON payload — search filters, viewed course IDs, calculator answers, etc.',
    example: {
      searched_occupation: 'Software Engineer',
      viewed_courses: ['uuid-1', 'uuid-2'],
      calculator_answers: { age: 32, english_level: 'superior' },
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Mark this progress record as completed',
  })
  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;
}
