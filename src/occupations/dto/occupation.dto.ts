import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SkilledList } from '../constants/visa-mapping';

export class CreateOccupationDto {
  @ApiProperty({ description: '6-digit ANZSCO code (primary key)', example: '261313' })
  @IsString()
  anzscoCode: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'ACS' })
  @IsString()
  @IsOptional()
  assessingAuthority?: string;

  /**
   * Replaces the previous onMltssl / onStsol / onRol boolean tags. A single
   * classifying skilled list; visa eligibility is derived from it via the
   * legislative matrix, so callers no longer set visa links directly.
   */
  @ApiPropertyOptional({
    enum: SkilledList,
    description: 'Skilled list that classifies this occupation',
  })
  @IsEnum(SkilledList)
  @IsOptional()
  primaryList?: SkilledList;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  pointsValue?: number;
}

export class UpdateOccupationDto extends PartialType(CreateOccupationDto) {}
