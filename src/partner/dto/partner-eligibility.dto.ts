import {
  IsArray,
  IsEmail,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Full answer set for the Partner Visa eligibility quiz
 * (subclasses 820 / 801 / 309 / 100 / 300).
 *
 * Option answers are stored as the literal option label the user picked so the
 * eligibility engine rules read the same as the quiz copy. Conditional
 * questions are optional; the engine treats an absent answer as "not asked".
 */
export class PartnerEligibilityDto {
  // ---- Names ----
  @ApiProperty({ description: 'Applicant first name' })
  @IsString()
  @MaxLength(100)
  applicantFirstName: string;

  @ApiProperty({ description: 'Sponsor first name' })
  @IsString()
  @MaxLength(100)
  sponsorFirstName: string;

  @ApiProperty({ enum: ['Applicant', 'Sponsor'] })
  @IsIn(['Applicant', 'Sponsor'])
  completedBy: string;

  // ---- English / interpreter ----
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  englishNative?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  interpreterNeed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  interpreterLanguage?: string;

  // ---- Applicant location & visa standing ----
  @ApiProperty({ description: 'Country the applicant currently lives in' })
  @IsString()
  @MaxLength(100)
  applicantCountry: string;

  @ApiPropertyOptional({ description: 'Australian state/territory (onshore only)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  applicantState?: string;

  @ApiPropertyOptional({ description: "Has the applicant's Australian visa expired?" })
  @IsOptional()
  @IsIn(['Yes', 'No'])
  visaExpired?: string;

  @ApiPropertyOptional({ description: "Is the applicant's visa a substantive visa?" })
  @IsOptional()
  @IsIn(['Yes', 'No'])
  substantiveVisa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  currentVisaTypeDetails?: string;

  @ApiPropertyOptional({ description: 'Current visa expiry date (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  visaExpiryDate?: string;

  @ApiPropertyOptional({
    description: 'Planning to apply for a new Australian visa within 6 months?',
  })
  @IsOptional()
  @IsIn(['Yes', 'No'])
  planningNewVisaSoon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  visaExpiredDetails?: string;

  // ---- Prospective Marriage visa history ----
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  arrivedOnPMV?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  sponsorWasPMVSponsor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  stillWithPMVSponsor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  pmvRelationshipEndDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pmvPreviousSponsorCircumstances?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  pmvCeased?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  marriedBeforePMVCeased?: string;

  @ApiPropertyOptional({ description: 'Legal status in country of residence (offshore only)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  applicantLegalStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  applicantLegalStatusDetails?: string;

  // ---- Sponsor status ----
  @ApiProperty({ description: "Sponsor's Australian residency status" })
  @IsString()
  @MaxLength(100)
  sponsorResidencyStatus: string;

  @ApiPropertyOptional({ description: 'How the sponsor obtained permanent residency' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sponsorPrPathway?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  sponsorPartnerVisaApplicationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  sponsorParentVisaGrantDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  sponsorVisitingVisaDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  sponsorStatusExplanation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sponsorCountry?: string;

  // ---- Sponsor's previous sponsorships ----
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  sponsorPreviouslySponsored?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  previousSponsorshipEnded?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['1', '2 or more'])
  previousSponsorshipCount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  previousSponsorshipLodgedDate?: string;

  // ---- Character / history ----
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  visaIssues?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  criminalOffences?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  techComfort?: string;

  // ---- Relationship ----
  @ApiProperty({ description: 'Relationship between applicant and sponsor' })
  @IsString()
  @MaxLength(100)
  relationshipStatus: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  marriageDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  engagementDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  intendedMarriageDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  datingStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  willingToMarry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  exclusiveRelationship?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nonExclusiveExplanation?: string;

  // ---- Living together ----
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  liveTogetherNow?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  livedTogetherBefore?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  livingTogetherSince?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  apartOverMonth?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  apartReasons?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  willingToLiveTogether?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  neverLivedTogetherReasons?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  neverLivedTogetherOther?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  metInPerson?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No', 'Not sure'])
  arrangedMarriage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  neverMetExplanation?: string;

  // ---- Family / health / age ----
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['0', '1', '2 or more'])
  additionalMigratingMembers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  seriousHealthConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  bothOver18?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  under18Explanation?: string;

  // ---- Marketing attribution ----
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  hearAboutUs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  hearAboutUsOther?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['Yes', 'No'])
  referred?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referralCode?: string;

  // ---- Contact ----
  @ApiProperty()
  @IsEmail()
  @MaxLength(255)
  email: string;
}
