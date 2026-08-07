import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * What the browser saw when Calendly confirmed a slot.
 *
 * Every field is optional on purpose. Calendly's embed has changed the shape of
 * its `event_scheduled` message between versions, and a booking we can charge
 * for is worth far more than a complete one — a row with only a prospect
 * attached still unblocks checkout, and the webhook fills in the rest.
 */
export class ReportBookingDto {
  /**
   * Calendly's invitee URI. The webhook's idempotency key, so passing it lets
   * the two paths recognise each other as the same booking.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  invitee_uri?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  event_uri?: string;

  /** Provisional: overwritten by Calendly's own value when the webhook lands. */
  @ApiPropertyOptional({ description: 'Slot start (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  starts_at?: string;

  @ApiPropertyOptional({ description: 'Slot end (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  ends_at?: string;
}
