import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({ description: 'Occupation name' })
  @IsString()
  @IsNotEmpty()
  occupation: string;

  @ApiProperty({ description: 'State (e.g. NSW, VIC)' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Visa subclass (e.g. 189, 190)' })
  @IsString()
  @IsNotEmpty()
  visa_class: string;

  @ApiProperty({ description: 'Points score' })
  @IsNumber()
  points: number;

  @ApiPropertyOptional({ description: 'Whether this is a priority occupation' })
  @IsOptional()
  @IsBoolean()
  priority?: boolean;

  @ApiPropertyOptional({ description: 'Days since invitation' })
  @IsOptional()
  @IsNumber()
  days_ago?: number;
}

export class UpdateInvitationDto {
  @ApiPropertyOptional({ description: 'Occupation name' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Visa subclass' })
  @IsOptional()
  @IsString()
  visa_class?: string;

  @ApiPropertyOptional({ description: 'Points score' })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiPropertyOptional({ description: 'Priority flag' })
  @IsOptional()
  @IsBoolean()
  priority?: boolean;

  @ApiPropertyOptional({ description: 'Days since invitation' })
  @IsOptional()
  @IsNumber()
  days_ago?: number;
}
