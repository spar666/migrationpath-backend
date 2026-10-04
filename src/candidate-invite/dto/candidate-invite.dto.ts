import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCandidateInviteDto {
  @IsString() @IsNotEmpty() business_prospect_id: string;
  @IsString() @IsNotEmpty() business_reference: string;
  @IsString() @IsNotEmpty() @MaxLength(160) candidate_name: string;
  @IsEmail() @MaxLength(160) candidate_email: string;
  @IsOptional() @IsString() @MaxLength(100) candidate_nationality?: string;
}

export class AcceptCandidateInviteDto {
  @IsString() @Matches(/\S/) token: string;
  @IsString() @Matches(/\S/) consent_text: string;
}
