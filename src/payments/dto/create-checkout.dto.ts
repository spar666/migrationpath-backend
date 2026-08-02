import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Starting checkout needs only the prospect id — the price is fixed server
 * side from STRIPE_CONSULT_PRICE_ID.
 *
 * The client never sends an amount. If it did, anyone could book a $600
 * consult for 50 cents by editing the request. This is the single most
 * important line in this file.
 */
export class CreateConsultationCheckoutDto {
  @IsUUID()
  prospect_id: string;

  /**
   * Optional: which booking this payment confirms. If omitted the service
   * uses the prospect's most recent booking.
   */
  @IsOptional()
  @IsUUID()
  booking_id?: string;

  @IsOptional()
  @IsIn(['consultation'])
  purpose?: 'consultation';

  /** Optional override of the configured return URLs, must be same-origin. */
  @IsOptional()
  @IsString()
  return_path?: string;
}
