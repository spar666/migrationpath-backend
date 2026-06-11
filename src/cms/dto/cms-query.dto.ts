import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CmsPaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;
}

export class FaqQueryDto extends CmsPaginationDto {
  @ApiPropertyOptional({ enum: ['General', 'Visa', 'Points', 'Consultation'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['Skilled', 'Student', 'Graduate', 'All'] })
  @IsOptional()
  @IsString()
  persona?: string;
}

export class GuideQueryDto extends CmsPaginationDto {
  @ApiPropertyOptional({ enum: ['General', 'Visa', 'PR', 'State'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['Skilled', 'Student', 'Graduate'] })
  @IsOptional()
  @IsString()
  persona?: string;

  @ApiPropertyOptional({ enum: ['Beginner', 'Intermediate', 'Advanced'] })
  @IsOptional()
  @IsString()
  difficulty?: string;
}

export class NewsArticleQueryDto extends CmsPaginationDto {
  @ApiPropertyOptional({
    enum: ['Visa', 'PR Pathway', 'State Nomination', 'Other'],
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['Skilled', 'Student', 'Graduate'] })
  @IsOptional()
  @IsString()
  target_persona?: string;
}
