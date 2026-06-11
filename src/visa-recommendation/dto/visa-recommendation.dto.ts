import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PointsResultDto } from '../../points-engine/dto/points.dto';

export class VisaRecommendationDto {
  @ApiProperty({ description: 'ANZSCO occupation code' })
  @IsString()
  @IsNotEmpty()
  anzscoCode: string;

  @ApiProperty({
    description: 'Points calculation result',
    type: PointsResultDto,
  })
  @ValidateNested()
  @Type(() => PointsResultDto)
  points: PointsResultDto;
}
