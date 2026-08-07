export declare class PreScreenContactDto {
    full_name: string;
    email: string;
    phone?: string;
    consent_given: boolean;
    consent_text?: string;
}
export declare class PreScreenApplicantDto {
    age?: number;
    occupation_code?: string;
    occupation_name?: string;
    occupation_listed?: boolean;
    years_experience?: number;
    english_overall?: number;
    english_lowest_band?: number;
    has_skills_assessment?: boolean;
    onshore?: boolean;
    current_visa?: string;
    has_health_or_character_concern?: boolean;
    preferred_subclass?: string;
}
export declare class PreScreenSponsorDto {
    legal_name?: string;
    trading_name?: string;
    abn?: string;
    industry?: string;
    employee_count?: number;
    years_trading?: number;
    state?: string;
    postcode?: string;
    business_address?: string;
    sponsored_last_5_years?: boolean;
    is_standard_business_sponsor?: boolean;
    annual_revenue_band?: string;
    years_operating_band?: string;
    operates_only_in_australia?: boolean;
    employee_count_band?: string;
    has_temporary_visa_employees?: boolean;
    referral_source?: string;
    sponsorship_status?: string;
    has_adverse_information?: boolean;
    meets_training_obligations?: boolean;
}
export declare class PreScreenNominationDto {
    occupation_code?: string;
    occupation_name?: string;
    position_title?: string;
    subclass?: string;
    annual_salary?: number;
    salary_band?: string;
    candidate_current_pay_band?: string;
    work_state?: string;
    work_postcode?: string;
    is_regional?: boolean;
    lmt_completed?: boolean;
}
export declare class PreScreenBusinessDto {
    sponsor?: PreScreenSponsorDto;
    nomination?: PreScreenNominationDto;
    candidate?: PreScreenApplicantDto;
}
export declare class SubmitPreScreenDto {
    party: 'applicant' | 'business';
    contact: PreScreenContactDto;
    applicant?: PreScreenApplicantDto;
    business?: PreScreenBusinessDto;
    sponsoring_employer?: PreScreenSponsorDto;
    offered_role?: PreScreenNominationDto;
    raw_answers?: Record<string, any>;
    source?: string;
}
