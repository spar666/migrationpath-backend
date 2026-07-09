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
  anzscoCode: string;

  @ApiProperty({ enum: SkilledList })
  @IsEnum(SkilledList)
  primaryList: SkilledList;
}

export class ImportOccupationListsDto {
  @ApiPropertyOptional({
    description: 'Re-resolve visa links from the matrix after import',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  resyncVisas?: boolean;

  @ApiProperty({ type: [ImportOccupationListRow] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportOccupationListRow)
  rows: ImportOccupationListRow[];
}
