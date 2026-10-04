import { Injectable, BadRequestException } from '@nestjs/common';
import { PointsRuleRepository } from './points-rule.repository';
import { PointsRule } from './entities/points-rule.entity';
import {
  UserProfileDto,
  StructuredPointsResultDto,
} from './dto/user-profile.dto';
import {
  PointsCategory,
  DEFAULT_VISA_GROUP,
} from './constants/points-catalogue';
import { PolicyConfigService } from '../policy-config/policy-config.service';

/**
 * Shown with every score. The points test is legislated and changes years
 * apart, so the date is carried as admin-editable config rather than a
 * constant — confirming the law is a config edit, not a deploy.
 */
const POINTS_DISCLAIMER = 'General information only, not migration advice.';

@Injectable()
export class PointsAggregatorService {
  constructor(
    private readonly ruleRepo: PointsRuleRepository,
    private readonly policyConfig: PolicyConfigService,
  ) {}

  /**
   * Aggregate a points score from the structured categories. Works for onshore
   * or offshore applicants — the only difference is how much Australian vs
   * overseas experience they carry, both of which feed the same combined cap.
   */
  async calculateTotalPoints(
    profile: UserProfileDto,
  ): Promise<StructuredPointsResultDto> {
    const visaGroup = profile.visaGroup || DEFAULT_VISA_GROUP;
    if (visaGroup !== DEFAULT_VISA_GROUP) throw new BadRequestException('Only GSM scoring is supported.');
    const maxAge = await this.policyConfig.getRequiredNumber(
      'points.gsmMaxAge',
    );

    const rules = await this.ruleRepo.findActive(visaGroup);

    const workCap = await this.policyConfig.getRequiredNumber(
      'points.combinedWorkCap',
    );
    const passMark = await this.policyConfig.getRequiredNumber(
      'points.gsmPassMark',
    );
    const currentAsOf = await this.policyConfig.latestEffectiveDate('points');

    const rangePoints = (category: PointsCategory, value: number): number => {
      const rule = rules.find(
        (r: PointsRule) =>
          r.category === category &&
          r.is_active &&
          r.min_value !== null &&
          r.max_value !== null &&
          value >= r.min_value &&
          value <= r.max_value,
      );
      return rule ? rule.points_value : 0;
    };

    const labelPoints = (category: PointsCategory, label: string): number => {
      const rule = rules.find(
        (r: PointsRule) =>
          r.category === category && r.is_active && r.attribute_label === label,
      );
      return rule ? rule.points_value : 0;
    };

    // ---- Individual categories ----
    const agePoints = rangePoints(PointsCategory.AGE, profile.age);
    const englishPoints = labelPoints(
      PointsCategory.ENGLISH,
      profile.englishLevel,
    );
    const qualificationPoints = labelPoints(
      PointsCategory.QUALIFICATIONS,
      profile.qualification,
    );
    const overseasWorkPoints = rangePoints(
      PointsCategory.OVERSEAS_WORK,
      profile.overseasWorkYears,
    );
    const australianWorkPoints = rangePoints(
      PointsCategory.AUSTRALIAN_WORK,
      profile.australianWorkYears,
    );
    const regionalStudyPoints = profile.regionalStudy
      ? labelPoints(PointsCategory.REGIONAL_STUDY, 'regional')
      : 0;

    // ---- Combined work-experience cap (admin-editable legislative boundary) ----
    const combinedWorkRaw = overseasWorkPoints + australianWorkPoints;
    const combinedWorkPoints = Math.min(combinedWorkRaw, workCap);
    const workCapApplied = combinedWorkRaw > workCap;

    const additional: Record<string, number> = {
      AUSTRALIAN_STUDY: profile.australianStudy ? labelPoints(PointsCategory.AUSTRALIAN_STUDY, 'standard') : 0,
      SPECIALIST_EDUCATION: profile.specialistEducation ? labelPoints(PointsCategory.SPECIALIST_EDUCATION, 'stem_research') : 0,
      PROFESSIONAL_YEAR: profile.professionalYear ? labelPoints(PointsCategory.PROFESSIONAL_YEAR, 'standard') : 0,
      COMMUNITY_LANGUAGE: profile.communityLanguage ? labelPoints(PointsCategory.COMMUNITY_LANGUAGE, 'ccl') : 0,
      PARTNER_SKILLS: profile.partnerSkills ? labelPoints(PointsCategory.PARTNER_SKILLS, profile.partnerSkills) : 0,
    };
    const totalPoints =
      agePoints +
      englishPoints +
      qualificationPoints +
      combinedWorkPoints +
      regionalStudyPoints + Object.values(additional).reduce((sum, points) => sum + points, 0);

    const breakdown: Record<string, number> = {
      ...additional,
      [PointsCategory.AGE]: agePoints,
      [PointsCategory.ENGLISH]: englishPoints,
      [PointsCategory.QUALIFICATIONS]: qualificationPoints,
      [PointsCategory.OVERSEAS_WORK]: overseasWorkPoints,
      [PointsCategory.AUSTRALIAN_WORK]: australianWorkPoints,
      WORK_EXPERIENCE_COMBINED: combinedWorkPoints,
      [PointsCategory.REGIONAL_STUDY]: regionalStudyPoints,
    };

    const ineligibilityReason =
      visaGroup === DEFAULT_VISA_GROUP && profile.age >= maxAge
        ? `The standard age requirement is under ${maxAge} for GSM subclasses.`
        : undefined;

    return {
      totalPoints,
      breakdown,
      workCapApplied,
      belowPassMark: totalPoints < passMark,
      ineligibilityReason,
      currentAsOf,
      disclaimer: POINTS_DISCLAIMER,
    };
  }
}
