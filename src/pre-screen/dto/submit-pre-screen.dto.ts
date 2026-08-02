import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Contact details — the same shape for both parties. This is the only part of
 * the submission that is mandatory: an incomplete questionnaire from someone
 * we can call back is worth more than a complete one from a ghost.
 */
export class PreScreenContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  /**
   * Must be true. The frontend ties this to a VISIBLE collection notice and
   * sends the notice text back in `consent_text` so we store what was shown.
   */
  @IsBoolean()
  consent_given: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  consent_text?: string;
}

/**
 * The applicant side of the questionnaire.
 *
 * Everything is optional and everything is nullable, because the engine
 * treats "not answered" as an open question rather than as a no. Making these
 * required would push people into guessing, which is worse than a blank.
 */
export class PreScreenApplicantDto {
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(99)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  occupation_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  occupation_name?: string;

  /**
   * ⚠️ Self-declared and therefore not evidence. The engine only falls back to
   * this until the occupations module is wired in — see OccupationListCheck.
   */
  @IsOptional()
  @IsBoolean()
  occupation_listed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  years_experience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9)
  english_overall?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9)
  english_lowest_band?: number;

  @IsOptional()
  @IsBoolean()
  has_skills_assessment?: boolean;

  @IsOptional()
  @IsBoolean()
  onshore?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  current_visa?: string;

  @IsOptional()
  @IsBoolean()
  has_health_or_character_concern?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  preferred_subclass?: string;
}

/** The employer, for a business-party submission. */
export class PreScreenSponsorDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legal_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  trading_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  abn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  industry?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  employee_count?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  years_trading?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postcode?: string;

  @IsOptional()
  @IsIn(['prospective', 'approved', 'lapsed', 'refused', 'unknown'])
  sponsorship_status?: string;

  @IsOptional()
  @IsBoolean()
  has_adverse_information?: boolean;

  @IsOptional()
  @IsBoolean()
  meets_training_obligations?: boolean;
}

/** The role being nominated. */
export class PreScreenNominationDto {
  @IsOptional()
  @IsString()
  @MaxLength(12)
  occupation_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  occupation_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  subclass?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annual_salary?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  work_state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  work_postcode?: string;

  @IsOptional()
  @IsBoolean()
  is_regional?: boolean;

  @IsOptional()
  @IsBoolean()
  lmt_completed?: boolean;
}

/** Business-party payload: the employer plus the role it wants to fill. */
export class PreScreenBusinessDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PreScreenSponsorDto)
  sponsor?: PreScreenSponsorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreScreenNominationDto)
  nomination?: PreScreenNominationDto;

  /**
   * Optional. A business that already has a candidate in mind can give their
   * details, and the engine assesses both sides in one pass.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => PreScreenApplicantDto)
  candidate?: PreScreenApplicantDto;
}

export class SubmitPreScreenDto {
  /** Set by the splash screen fork. */
  @IsIn(['applicant', 'business'])
  party: 'applicant' | 'business';

  @ValidateNested()
  @Type(() => PreScreenContactDto)
  contact: PreScreenContactDto;

  /** Required when party = 'applicant'. */
  @IsOptional()
  @ValidateNested()
  @Type(() => PreScreenApplicantDto)
  applicant?: PreScreenApplicantDto;

  /** Required when party = 'business'. */
  @IsOptional()
  @ValidateNested()
  @Type(() => PreScreenBusinessDto)
  business?: PreScreenBusinessDto;

  /**
   * An applicant may name the employer sponsoring them, if there is one.
   * Creates the sponsor record so the two sides can be joined later.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => PreScreenSponsorDto)
  sponsoring_employer?: PreScreenSponsorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreScreenNominationDto)
  offered_role?: PreScreenNominationDto;

  /**
   * The full raw answer set exactly as the questionnaire produced it,
   * including questions the engine does not read.
   *
   * Stored verbatim on the summary: the engine's view of an answer is lossy,
   * and when the agent is on the call they want what the person actually said,
   * not what the engine kept. It is also the only way to re-score a past
   * submission after the rules change.
   */
  @IsOptional()
  @IsObject()
  raw_answers?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(48)
  source?: string;
}
