import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Lightweight capture — used by calculators and other verticals that are NOT
 * the employer-sponsored questionnaire. It does not run the eligibility
 * engine; it just puts a person on the funnel spine so nothing is lost.
 *
 * The employer-sponsored questionnaire uses POST /pre-screen instead.
 */
export class CreateProspectDto {
  @IsOptional()
  @IsIn(['applicant', 'business'])
  party?: 'applicant' | 'business';

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

  @IsOptional()
  @IsString()
  @MaxLength(160)
  company_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(48)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  visa_interest?: string;

  /**
   * Must be true and must correspond to a collection notice the user could
   * actually see. The service rejects a capture without it.
   */
  @IsBoolean()
  consent_given: boolean;

  @IsOptional()
  @IsString()
  consent_text?: string;

  /** Free-form calculator output / partial answers, stored on the summary. */
  @IsOptional()
  @IsObject()
  answers?: Record<string, any>;
}
