import { Injectable } from '@nestjs/common';
import { OccupationsService } from '../occupations/occupations.service';
import { PointsResultDto } from '../points-engine/dto/points.dto';
import { PolicyConfigService } from '../policy-config/policy-config.service';

export interface VisaRecommendation {
  subclass: string;
  name: string;
  eligible: boolean;
  reason?: string;
}

/** Subclasses whose eligibility is gated by the GSM points test. */
const POINTS_TESTED_SUBCLASSES = new Set(['189', '190', '491', '485']);

@Injectable()
export class VisaRecommendationService {
  constructor(
    private readonly occupationsService: OccupationsService,
    private readonly policyConfig: PolicyConfigService,
  ) {}

  /**
   * Candidate visas come from the occupations master (occupation_visas junction);
   * the GSM pass mark that gates the points-tested subclasses is admin-editable
   * (fallback 65).
   */
  async recommend(
    anzscoCode: string,
    points: PointsResultDto,
  ): Promise<VisaRecommendation[]> {
    const eligibleVisas =
      await this.occupationsService.getEligibleVisas(anzscoCode);
    if (!eligibleVisas.length) return [];

    const passMark = await this.policyConfig.getNumber('points.gsmPassMark', 65);
    const meetsPassMark = points.totalPoints >= passMark;

    return eligibleVisas.map((visa) => {
      const isPointsTested = POINTS_TESTED_SUBCLASSES.has(visa.subclassNumber);

      if (!isPointsTested) {
        return {
          subclass: visa.subclassNumber,
          name: visa.name ?? visa.streamTitle,
          eligible: true,
          reason: 'Employer-sponsored / nomination pathway — not points-tested',
        };
      }

      const eligible =
        meetsPassMark ||
        (visa.subclassNumber === '491' && !!points.regionalBonus);

      return {
        subclass: visa.subclassNumber,
        name: visa.name ?? visa.streamTitle,
        eligible,
        reason: eligible ? undefined : `Minimum ${passMark} points required`,
      };
    });
  }
}
