import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateOccupationDto {
  @ApiProperty()
  @IsString()
  anzscoCode: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  skillLevel?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assessingAuthority?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  onMltssl?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  onStsol?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  onRol?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  pointsValue?: number;
}

export class UpdateOccupationDto extends PartialType(CreateOccupationDto) {}
