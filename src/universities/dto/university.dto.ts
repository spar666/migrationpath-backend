import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateUniversityDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cricosProviderCode?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  enrolmentCapReached?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;
}

export class UpdateUniversityDto extends PartialType(CreateUniversityDto) {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
