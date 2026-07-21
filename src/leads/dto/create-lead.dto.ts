import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUUID,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { LeadSource } from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({ description: 'Full name of the prospective client' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  full_name: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Visa type of interest' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  visa_type?: string;

  @ApiPropertyOptional({ description: 'Free-text message / notes from the prospect' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional({ description: 'Service package the lead was viewing, if any' })
  @IsOptional()
  @IsUUID()
  package_id?: string;

  @ApiPropertyOptional({
    description: 'Where the lead came from',
    enum: ['quote_slideover', 'quote_page', 'partner_eligibility', 'other'],
    default: 'other',
  })
  @IsOptional()
  @IsIn(['quote_slideover', 'quote_page', 'partner_eligibility', 'other'])
  source?: LeadSource;

  @ApiPropertyOptional({
    description:
      'Honeypot field. Must be left empty by real users — the frontend ' +
      'hides it visually. Any non-empty value marks the submission as spam.',
  })
  @IsOptional()
  @IsString()
  website?: string;
}
