import { ArrayNotEmpty, ArrayUnique, IsDateString, IsNotEmpty, Matches } from 'class-validator';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SkilledList } from '../constants/visa-mapping';

export class ImportOccupationListRow {
  @ApiProperty({ example: '261313' })
  @IsString()
  @Matches(/^\d{6}$/)
  anzscoCode: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(SkilledList, { each: true })
  lists: SkilledList[];

  @IsString()
  @IsNotEmpty()
  title: string;
}

export class ImportOccupationListsDto {
  @IsString()
  @Matches(/\S/)
  sourceNote: string;

  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({
    description: 'Re-resolve visa links from the matrix after import',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  resyncVisas?: boolean;

  @ApiProperty({ type: [ImportOccupationListRow] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ImportOccupationListRow)
  rows: ImportOccupationListRow[];
}
