import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  email_updates?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  invitation_alerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  document_reminders?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  news_alerts?: boolean;
}
