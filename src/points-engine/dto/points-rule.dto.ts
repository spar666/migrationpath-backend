import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePointsRuleDto {
  @ApiProperty({
    example: 'GSM',
    description:
      'Visa group (GSM, Business, Criteria_Only, Relationship, Sponsorship)',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['GSM', 'Business', 'Criteria_Only', 'Relationship', 'Sponsorship'])
  visa_group: string;

  @ApiProperty({ example: 'age', description: 'Rule category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: '25-32',
    description: 'Rule sub-category',
    required: false,
  })
  @IsString()
  @IsOptional()
  sub_category?: string;

  @ApiProperty({
    example: '25-32',
    description: 'Human readable label',
    required: false,
  })
  @IsString()
  @IsOptional()
  attribute_label?: string;

  @ApiProperty({
    example: 25,
    description: 'Minimum value for range-based rules',
    required: false,
  })
  @IsInt()
  @IsOptional()
  min_value?: number;

  @ApiProperty({
    example: 32,
    description: 'Maximum value for range-based rules',
    required: false,
  })
  @IsInt()
  @IsOptional()
  max_value?: number;

  @ApiProperty({ example: 30, description: 'Points awarded' })
  @IsInt()
  @IsNotEmpty()
  points_value: number;

  @ApiProperty({
    example: true,
    description: 'Whether the rule is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdatePointsRuleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsIn(['GSM', 'Business', 'Criteria_Only', 'Relationship', 'Sponsorship'])
  visa_group?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sub_category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  attribute_label?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  min_value?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  max_value?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  points_value?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
