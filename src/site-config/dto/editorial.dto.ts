import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ReviewerDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @Matches(/^\d{7}$/)
  marn?: string;
}

/** Editorial dates are supplied by the editor, never assigned by a rebuild. */
export class EditorialFieldsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  reviewedAt?: string;

  @ApiPropertyOptional({ type: ReviewerDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReviewerDto)
  reviewer?: ReviewerDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  sourceUrls?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];
}

export class OccupationEditorialDto extends EditorialFieldsDto {
  @Matches(/^\d{6}$/)
  anzscoCode: string;
}
