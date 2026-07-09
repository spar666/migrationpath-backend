import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMigrationRuleDto {
  @ApiProperty({
    example: 'student',
    description: 'Persona type (student, skilled, onshore, partner, employer)',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['student', 'skilled', 'onshore', 'partner', 'employer'])
  persona_type: string;

  @ApiProperty({ example: 'Passport', description: 'Document name' })
  @IsString()
  @IsNotEmpty()
  document_name: string;

  @ApiProperty({
    example: 'Valid passport with at least 6 months validity',
    description: 'Optional description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the document is mandatory',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_mandatory?: boolean;
}
