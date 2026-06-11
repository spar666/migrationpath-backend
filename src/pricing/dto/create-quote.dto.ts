import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty({ description: 'ID of the service package' })
  @IsUUID()
  @IsNotEmpty()
  package_id: string;

  @ApiProperty({ description: 'Custom notes for the quote', required: false })
  @IsOptional()
  @IsString()
  custom_notes?: string;
}
