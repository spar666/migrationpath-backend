import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateCampusDto {
  @ApiProperty()
  @IsUUID()
  universityId: string;

  @ApiProperty()
  @IsString()
  campusName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postcode?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isRegional?: boolean;
}

export class UpdateCampusDto extends PartialType(CreateCampusDto) {}
