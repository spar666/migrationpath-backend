import { IsNumber, IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePointsConfigDto {
  @ApiPropertyOptional({ description: 'Points value' })
  @IsOptional()
  @IsNumber()
  points_value?: number;

  @ApiPropertyOptional({ description: 'Whether this config is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Category name' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Attribute name' })
  @IsOptional()
  @IsString()
  attribute_name?: string;
}
