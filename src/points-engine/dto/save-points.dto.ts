import { IsString, IsInt, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SavePointsDto {
  @ApiProperty({ description: 'The selections/answers that produced this score' })
  @IsObject()
  selections: Record<string, any>;

  @ApiProperty({ description: 'Full points breakdown result' })
  @IsObject()
  breakdown: Record<string, any>;

  @ApiProperty({ description: 'Persona type (student, skilled, onshore, etc.)' })
  @IsString()
  personaType: string;
}

export class CompareScenariosDto {
  @ApiProperty({ description: 'Array of scenario inputs to compare' })
  scenarios: Record<string, any>[];

  @ApiProperty({ description: 'Persona type for comparison' })
  @IsString()
  personaType: string;
}
