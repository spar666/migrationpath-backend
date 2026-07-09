import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmptyObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PageConfigDto {
  @ApiProperty({ description: 'Hero headline text' })
  @IsString()
  heroHeadline: string;

  @ApiProperty({ description: 'Hero subtext / description' })
  @IsString()
  heroSubtext: string;

  @ApiPropertyOptional({ description: 'Hero image (base64 data URL or empty)' })
  @IsString()
  @IsOptional()
  heroImage?: string;

  @ApiProperty({ description: 'Primary CTA button label' })
  @IsString()
  primaryCta: string;

  @ApiProperty({ description: 'Secondary CTA button label' })
  @IsString()
  secondaryCta: string;

  @ApiPropertyOptional({
    description: 'List of benefit/feature bullet points',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[];
}

export class HomePageConfigDto extends PageConfigDto {
  @ApiProperty({ description: 'Migration outlook section title' })
  @IsString()
  outlookTitle: string;

  @ApiProperty({ description: 'Migration outlook section description' })
  @IsString()
  outlookDescription: string;

  @ApiProperty({ description: 'Healthcare processing time display text' })
  @IsString()
  processingTimeHealthcare: string;

  @ApiProperty({ description: 'Tech processing time display text' })
  @IsString()
  processingTimeTech: string;
}

export class FooterConfigDto {
  @ApiProperty({ description: 'MARA compliance statement' })
  @IsString()
  maraStatement: string;

  @ApiPropertyOptional({
    description: 'Quick links for footer navigation',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  quickLinks?: string[];

  @ApiPropertyOptional({
    description: 'Resource links for footer',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resourceLinks?: string[];
}

export class UpdateSiteConfigDto {
  @ApiProperty({ description: 'Home page configuration', type: HomePageConfigDto })
  @ValidateNested()
  @Type(() => HomePageConfigDto)
  @IsNotEmptyObject()
  home: HomePageConfigDto;

  @ApiProperty({ description: 'Student page configuration', type: PageConfigDto })
  @ValidateNested()
  @Type(() => PageConfigDto)
  @IsNotEmptyObject()
  student: PageConfigDto;

  @ApiProperty({ description: 'Skilled page configuration', type: PageConfigDto })
  @ValidateNested()
  @Type(() => PageConfigDto)
  @IsNotEmptyObject()
  skilled: PageConfigDto;

  @ApiProperty({ description: 'Partner page configuration', type: PageConfigDto })
  @ValidateNested()
  @Type(() => PageConfigDto)
  @IsNotEmptyObject()
  partner: PageConfigDto;

  @ApiProperty({ description: 'Onshore page configuration', type: PageConfigDto })
  @ValidateNested()
  @Type(() => PageConfigDto)
  @IsNotEmptyObject()
  onshore: PageConfigDto;

  @ApiProperty({ description: 'Footer configuration', type: FooterConfigDto })
  @ValidateNested()
  @Type(() => FooterConfigDto)
  @IsNotEmptyObject()
  footer: FooterConfigDto;
}
