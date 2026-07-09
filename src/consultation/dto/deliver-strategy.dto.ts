import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeliverStrategyDto {
  @ApiProperty({ description: 'Strategy delivery content' })
  @IsString()
  @IsNotEmpty()
  strategy: string;
}
