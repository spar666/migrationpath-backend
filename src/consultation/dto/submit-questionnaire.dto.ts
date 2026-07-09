import { IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuestionnaireDto {
  @ApiProperty({ description: 'Questionnaire responses object' })
  @IsObject()
  @IsNotEmpty()
  responses: Record<string, any>;
}
