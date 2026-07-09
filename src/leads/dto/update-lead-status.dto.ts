import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { LeadStatus } from '../entities/lead.entity';

export class UpdateLeadStatusDto {
  @ApiProperty({
    description: 'New status for the lead',
    enum: ['new', 'contacted', 'converted', 'archived'],
  })
  @IsIn(['new', 'contacted', 'converted', 'archived'])
  @IsNotEmpty()
  status: LeadStatus;
}
