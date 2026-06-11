import { ApiProperty } from '@nestjs/swagger';

export class InvitationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  occupation: string;

  @ApiProperty({ name: 'visa_class' })
  visa_class: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  points: number;

  @ApiProperty({ name: 'days_ago' })
  days_ago: number;

  @ApiProperty()
  priority: boolean;
}
