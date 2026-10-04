import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
export class ReviewProspectDto {
  @IsOptional() @IsBoolean() statutory_eligible?: boolean;
  @IsOptional() @IsBoolean() client_fit?: boolean;
  @IsString() @Matches(/\S/) @MaxLength(10000) agent_notes: string;
}
