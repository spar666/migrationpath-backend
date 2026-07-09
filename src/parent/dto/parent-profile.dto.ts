import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SponsorStatus {
  CITIZEN = 'citizen',
  PERMANENT_RESIDENT = 'permanent_resident',
  ELIGIBLE_NZ = 'eligible_nz',
  NONE = 'none', // not an eligible sponsor
}

export class ParentProfileDto {
  // ---- Gate 1: Sponsor ----
  @ApiProperty({ enum: SponsorStatus, description: 'Sponsoring child status' })
  @IsEnum(SponsorStatus)
  sponsorStatus: SponsorStatus;

  @ApiProperty({
    description: 'Months the sponsoring child has lawfully resided in Australia',
    example: 30,
  })
  @IsInt()
  @Min(0)
  @Max(1200)
  sponsorMonthsInAustralia: number;

  // ---- Gate 2: Balance of Family ----
  @ApiProperty({ description: 'Total number of children the parent has, globally' })
  @IsInt()
  @Min(0)
  @Max(50)
  totalChildren: number;

  @ApiProperty({
    description: 'Children who are permanent residents/citizens living in Australia',
  })
  @IsInt()
  @Min(0)
  @Max(50)
  childrenInAustralia: number;

  @ApiPropertyOptional({
    description:
      'Number of children living in the single other country with the most children (for the alternative limb of the test)',
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  childrenInLargestOtherCountry?: number;

  // ---- Gate 3: Assurance of Support ----
  @ApiProperty({ description: "Sponsor's current taxable income (AUD)", example: 72000 })
  @IsInt()
  @Min(0)
  sponsorTaxableIncome: number;

  // ---- Visa path ----
  @ApiProperty({ description: 'Age of the applying parent (years)', example: 68 })
  @IsInt()
  @Min(0)
  @Max(120)
  parentAge: number;
}
