import { ApiProperty } from '@nestjs/swagger';

export type PillarKey = 'financial' | 'household' | 'social' | 'commitment';

export type CommitmentStatus = 'LEGALLY UNLOCKED' | 'STANDARD';

export interface PillarResult {
  key: PillarKey;
  label: string;
  score: number; // 0-100 (capped)
  percentage: number; // same as score, expressed as the pillar health %
  status: CommitmentStatus;
}

export interface PredictedVisa {
  subclass: '820' | '309';
  name: string;
  location: 'onshore' | 'offshore';
}

export class PartnerAuditResultDto {
  @ApiProperty({ description: 'Persisted audit id' })
  auditId: string;

  @ApiProperty({ description: 'Overall application readiness percentage (0-100)' })
  overallReadiness: number;

  @ApiProperty({ description: 'Per-pillar results (financial, household, social, commitment)' })
  pillars: PillarResult[];

  @ApiProperty({ description: 'Predicted visa path based on physical location' })
  predictedVisa: PredictedVisa;

  @ApiProperty({
    description:
      'True when the BDM registration waiver unlocks the commitment track despite <12 months cohabitation',
  })
  legislativeWaiverApplied: boolean;

  @ApiProperty({ description: 'Commitment track status', enum: ['LEGALLY UNLOCKED', 'STANDARD'] })
  commitmentStatus: CommitmentStatus;

  @ApiProperty({ description: 'Targeted, actionable legal recommendations', type: [String] })
  recommendations: string[];
}
