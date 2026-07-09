import { ApiProperty } from '@nestjs/swagger';

export type ParentStatus = 'LEGALLY_ELIGIBLE' | 'LEGALLY_INELIGIBLE';

export interface SponsorCheckResult {
  pass: boolean;
  reason?: string;
}

export interface BalanceOfFamilyResult {
  childrenInAustralia: number;
  totalChildren: number;
  percentage: number; // 0-100
  pass: boolean; // >= 50% limb
  alternativeLimbPass: boolean; // more children in AU than any other single country
  reason?: string;
}

export interface AosResult {
  sponsorTaxableIncome: number;
  benchmark: number;
  meetsBenchmark: boolean;
  requiresCoAssurer: boolean;
  warning?: string;
}

export interface ParentPredictedVisa {
  subclass: string;
  name: string;
  track: 'aged_parent' | 'contributory_parent';
}

export class ParentAuditResultDto {
  @ApiProperty()
  auditId: string;

  @ApiProperty({ description: 'Overall eligibility flag (Gates 1 and 2 both pass)' })
  isEligible: boolean;

  @ApiProperty({ enum: ['LEGALLY_ELIGIBLE', 'LEGALLY_INELIGIBLE'] })
  status: ParentStatus;

  @ApiProperty({ description: 'Balance of Family Test result' })
  balanceOfFamily: BalanceOfFamilyResult;

  @ApiProperty({ description: 'Sponsor eligibility check (Gate 1)' })
  sponsorCheck: SponsorCheckResult;

  @ApiProperty({ description: 'Assurance of Support income check (Gate 3, warning-only)' })
  aos: AosResult;

  @ApiProperty({ description: 'Predicted visa path based on age bracket' })
  predictedVisa: ParentPredictedVisa;

  @ApiProperty({ type: [String] })
  recommendations: string[];
}
