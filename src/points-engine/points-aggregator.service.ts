import { Injectable } from '@nestjs/common';
import { PointsRuleRepository } from './points-rule.repository';
import { PointsRule } from './entities/points-rule.entity';
import {
  UserProfileDto,
  StructuredPointsResultDto,
} from './dto/user-profile.dto';
import {
  PointsCategory,
  COMBINED_WORK_POINTS_CAP,
  GSM_PASS_MARK,
  GSM_MAX_AGE,
  DEFAULT_VISA_GROUP,
} from './constants/points-catalogue';
import { PolicyConfigService } from '../policy-config/policy-config.service';

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

    const rules = await this.ruleRepo.findActive(visaGroup);

    // Admin-editable boundaries; fallbacks match the original constants.
    const workCap = await this.policyConfig.getNumber(
      'points.combinedWorkCap',
      COMBINED_WORK_POINTS_CAP,
    );
    const passMark = await this.policyConfig.getNumber(
      'points.gsmPassMark',
      GSM_PASS_MARK,
    );

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
          r.category === category &&
          r.is_active &&
          r.attribute_label === label,
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

    const totalPoints =
      agePoints +
      englishPoints +
      qualificationPoints +
      combinedWorkPoints +
      regionalStudyPoints;

    const breakdown: Record<string, number> = {
      [PointsCategory.AGE]: agePoints,
      [PointsCategory.ENGLISH]: englishPoints,
      [PointsCategory.QUALIFICATIONS]: qualificationPoints,
      [PointsCategory.OVERSEAS_WORK]: overseasWorkPoints,
      [PointsCategory.AUSTRALIAN_WORK]: australianWorkPoints,
      WORK_EXPERIENCE_COMBINED: combinedWorkPoints,
      [PointsCategory.REGIONAL_STUDY]: regionalStudyPoints,
    };

    const ineligibilityReason =
      visaGroup === DEFAULT_VISA_GROUP && profile.age >= GSM_MAX_AGE
        ? `Ineligible: applicants must be under ${GSM_MAX_AGE} for GSM subclasses.`
        : undefined;

    return {
      totalPoints,
      breakdown,
      workCapApplied,
      belowPassMark: totalPoints < passMark,
      ineligibilityReason,
    };
  }
}
