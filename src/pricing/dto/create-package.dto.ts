import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ description: 'Package name' })
  @IsString()
  @IsNotEmpty()
  package_name: string;

  @ApiProperty({ description: 'Visa subclass code' })
  @IsString()
  @IsNotEmpty()
  visa_subclass: string;

  @ApiProperty({
    description: 'Package category',
    enum: ['student', 'skilled', 'family', 'employer'],
  })
  @IsEnum(['student', 'skilled', 'family', 'employer'])
  category: 'student' | 'skilled' | 'family' | 'employer';

  @ApiProperty({ description: 'Professional fees amount' })
  @IsNumber()
  professional_fees: number;

  @ApiProperty({ description: 'Government charges amount' })
  @IsNumber()
  government_charges: number;

  @ApiProperty({ description: 'Estimated extras amount' })
  @IsNumber()
  estimated_extras: number;

  @ApiProperty({ description: 'List of inclusions', type: [String] })
  @IsArray()
  @IsString({ each: true })
  inclusions: string[];

  @ApiPropertyOptional({
    description: 'Whether the package is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  display_order?: number;
}
