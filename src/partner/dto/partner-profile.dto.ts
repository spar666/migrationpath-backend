import { IsBoolean, IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ApplicantLocation {
  ONSHORE = 'onshore', // currently in Australia -> subclass 820
  OFFSHORE = 'offshore', // currently outside Australia -> subclass 309
}

/**
 * Evidentiary self-assessment for a Partner visa (subclass 820 / 309).
 * Each boolean represents whether the couple currently holds that category of
 * evidence. Grouped by the four legislative pillars used by Home Affairs.
 */
export class PartnerProfileDto {
  @ApiProperty({
    enum: ApplicantLocation,
    description: 'Applicant physical location (drives 820 vs 309)',
  })
  @IsEnum(ApplicantLocation)
  currentLocation: ApplicantLocation;

  // ---- Financial Aspects ----
  @ApiPropertyOptional({ description: 'Holds joint bank account(s)' })
  @IsBoolean()
  @IsOptional()
  jointBankAccounts?: boolean;

  @ApiPropertyOptional({ description: 'Joint lease or mortgage in both names' })
  @IsBoolean()
  @IsOptional()
  jointLeaseOrMortgage?: boolean;

  @ApiPropertyOptional({ description: 'Shared utility bills' })
  @IsBoolean()
  @IsOptional()
  sharedUtilityBills?: boolean;

  // ---- Nature of Household ----
  @ApiPropertyOptional({ description: 'Shared responsibility for domestic bills' })
  @IsBoolean()
  @IsOptional()
  sharedDomesticBills?: boolean;

  @ApiPropertyOptional({ description: 'Joint responsibility for children' })
  @IsBoolean()
  @IsOptional()
  jointChildResponsibility?: boolean;

  @ApiPropertyOptional({ description: 'Matching historical address log' })
  @IsBoolean()
  @IsOptional()
  matchingAddressHistory?: boolean;

  // ---- Social Aspects ----
  @ApiPropertyOptional({ description: 'Shared travel itineraries' })
  @IsBoolean()
  @IsOptional()
  sharedTravelItineraries?: boolean;

  @ApiPropertyOptional({
    description:
      'Number of Form 888 statutory declarations available from Australian citizens/PRs',
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  form888Count?: number;

  @ApiPropertyOptional({ description: 'Joint social invitations addressed to both' })
  @IsBoolean()
  @IsOptional()
  jointSocialInvitations?: boolean;

  // ---- Commitment Aspects ----
  @ApiPropertyOptional({ description: 'Lived together for 12+ months' })
  @IsBoolean()
  @IsOptional()
  livedTogether12Months?: boolean;

  @ApiPropertyOptional({
    description: 'De facto relationship registered with an Australian State/Territory BDM',
  })
  @IsBoolean()
  @IsOptional()
  registeredRelationshipBDM?: boolean;
}
