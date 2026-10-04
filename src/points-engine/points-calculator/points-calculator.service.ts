import { BadRequestException, Injectable } from '@nestjs/common';
import { PointsInputDto, PointsResultDto, BusinessPointsInputDto } from '../dto/points.dto';
import { PointsAggregatorService } from '../points-aggregator.service';
import { PolicyConfigService } from '../../policy-config/policy-config.service';
import { EnglishProficiency, QualificationLevel } from '../constants/points-catalogue';

@Injectable()
export class PointsCalculatorService {
  constructor(private readonly aggregator: PointsAggregatorService, private readonly policy: PolicyConfigService) {}

  async calculatePoints(input: PointsInputDto): Promise<PointsResultDto> {
    if (input.visaGroup !== 'GSM' || !['189', '190', '491'].includes(input.subclass)) {
      throw new BadRequestException('Only GSM subclasses 189, 190 and 491 are supported.');
    }
    if (!Object.values(EnglishProficiency).includes(input.englishLevel as EnglishProficiency) ||
        !Object.values(QualificationLevel).includes(input.educationLevel as QualificationLevel)) {
      throw new BadRequestException('Use the English and qualification labels from the Points Rubric.');
    }
    const base = await this.aggregator.calculateTotalPoints({
      age: input.age, englishLevel: input.englishLevel as EnglishProficiency,
      qualification: input.educationLevel as QualificationLevel,
      overseasWorkYears: input.workExperienceOverseas, australianWorkYears: input.workExperienceAustralia,
      australianStudy: input.australianStudyRequirement, regionalStudy: input.australianStudyRequirement && input.isRegional,
      specialistEducation: input.stemResearch, professionalYear: input.professionalYear,
      communityLanguage: input.naati, partnerSkills: input.partnerSkills,
    });
    const nomination = input.subclass === '190' ? await this.policy.getRequiredNumber('points.stateNominationBonus')
      : input.subclass === '491' ? await this.policy.getRequiredNumber('points.regionalNominationBonus') : 0;
    const totalPoints = base.totalPoints + nomination;
    return { ...base, totalPoints, breakdown: { ...base.breakdown, NOMINATION: nomination },
      belowPassMark: totalPoints < await this.policy.getRequiredNumber('points.gsmPassMark'),
      regionalBonus: input.subclass === '491', prAdvantageBadge: false };
  }

  async calculateBusinessPoints(_input: BusinessPointsInputDto): Promise<PointsResultDto> {
    throw new BadRequestException('Business points scoring has been retired.');
  }
}
