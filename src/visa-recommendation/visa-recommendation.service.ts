import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Occupation } from '../occupations/entities/occupation.entity';
import { PointsResultDto } from '../points-engine/dto/points.dto';

export interface VisaRecommendation {
  subclass: string;
  name: string;
  eligible: boolean;
  reason?: string;
}

@Injectable()
export class VisaRecommendationService {
  constructor(
    @InjectRepository(Occupation)
    private readonly occupationRepository: Repository<Occupation>,
  ) {}

  async recommend(
    anzscoCode: string,
    points: PointsResultDto,
  ): Promise<VisaRecommendation[]> {
    const occupation = await this.occupationRepository.findOne({
      where: { anzsco_code: anzscoCode },
      relations: ['thresholds'],
    });

    if (!occupation) return [];

    const recommendations: VisaRecommendation[] = [];

    // TODO: Add 'onMltssl' field to the Occupation entity for more accurate visa eligibility.
    // For now, assuming eligibility based on existence in occupations_list.

    // Subclass 189 (Skilled Independent)
    recommendations.push({
      subclass: '189',
      name: 'Skilled Independent',
      eligible: points.totalPoints >= 65,
      reason:
        points.totalPoints < 65 ? 'Minimum 65 points required' : undefined,
    });

    // Subclass 190 (Skilled Nominated)
    recommendations.push({
      subclass: '190',
      name: 'Skilled Nominated',
      eligible: points.totalPoints >= 65,
    });

    // Subclass 491 (Skilled Regional)
    if (points.regionalBonus || points.totalPoints >= 65) {
      recommendations.push({
        subclass: '491',
        name: 'Skilled Regional (Provisional)',
        eligible: true,
      });
    }

    return recommendations;
  }
}
