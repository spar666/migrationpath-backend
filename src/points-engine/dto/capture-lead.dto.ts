import { Matches } from 'class-validator';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfileDto } from './user-profile.dto';

/**
 * Contact capture at the end of the points calculator.
 *
 * Note that `profile` is the full set of calculator inputs, not a score. The
 * score is recomputed server-side from these inputs — a client-supplied total
 * would let anyone write an arbitrary number onto a prospect record that an
 * agent then acts on.
 */
export class CaptureCalculatorLeadDto {
  @ApiProperty({ description: "The person's full name" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  full_name: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiProperty({
    description: 'The calculator inputs the score is recomputed from',
    type: UserProfileDto,
  })
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile: UserProfileDto;

  /**
   * Must be true. The service refuses the capture otherwise rather than
   * storing consent_given=false — we should not hold personal information we
   * were not given permission to collect.
   */
  @ApiProperty({ description: 'Whether the collection notice was accepted' })
  @IsBoolean()
  consent_given: boolean;

  @ApiPropertyOptional({
    description: 'The exact collection notice text the person was shown',
  })
  @IsString()
  @Matches(/\S/)
  consent_text: string;

  @ApiPropertyOptional({ description: 'Marketing and referral attribution' })
  @IsOptional()
  @IsObject()
  attribution?: Record<string, any>;
}
