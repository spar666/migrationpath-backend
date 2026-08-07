import { OccupationListCheck, SubclassRule } from './constants/employer-sponsored.config';
export interface ApplicantFacts {
    age?: number;
    occupation_code?: string;
    occupation_name?: string;
    occupation_listed?: boolean | null;
    years_experience?: number;
    english_overall?: number;
    english_lowest_band?: number;
    has_skills_assessment?: boolean | null;
    onshore?: boolean | null;
    current_visa?: string;
    has_health_or_character_concern?: boolean | null;
    preferred_subclass?: string;
}
export interface SponsorFacts {
    legal_name?: string;
    trading_name?: string;
    abn?: string;
    industry?: string;
    years_trading?: number;
    employee_count?: number;
    sponsorship_status?: string;
    has_adverse_information?: boolean | null;
    meets_training_obligations?: boolean | null;
    state?: string;
    postcode?: string;
    business_address?: string;
    sponsored_last_5_years?: boolean | null;
    is_standard_business_sponsor?: boolean | null;
    annual_revenue_band?: string;
    years_operating_band?: string;
    operates_only_in_australia?: boolean | null;
    employee_count_band?: string;
    has_temporary_visa_employees?: boolean | null;
    referral_source?: string;
}
export interface NominationFacts {
    occupation_code?: string;
    occupation_name?: string;
    position_title?: string;
    subclass?: string;
    annual_salary?: number;
    salary_band?: string;
    candidate_current_pay_band?: string;
    work_state?: string;
    work_postcode?: string;
    is_regional?: boolean | null;
    lmt_completed?: boolean | null;
}
export interface SubclassAssessment {
    subclass: string;
    label: string;
    eligible: boolean;
    unknowns: string[];
    undetermined: string[];
    blockers: string[];
    passes: string[];
    permanentResidence: SubclassRule['permanentResidence'];
}
export interface EligibilityResult {
    statutory_eligible: boolean;
    client_fit: boolean;
    recommended_subclass?: string;
    recommended_label?: string;
    reasons: string[];
    blockers: string[];
    open_questions: string[];
    assessments: SubclassAssessment[];
    sponsor_findings: string[];
    assessed_at: string;
    engine_version: string;
}
export declare const ENGINE_VERSION = "0.1.0-placeholder-rules";
export declare class EmployerSponsoredEngine {
    private readonly logger;
    private occupationListCheck;
    setOccupationListCheck(check: OccupationListCheck): void;
    assess(input: {
        party: 'applicant' | 'business';
        applicant?: ApplicantFacts;
        sponsor?: SponsorFacts;
        nomination?: NominationFacts;
    }): Promise<EligibilityResult>;
    private assessSubclass;
    private checkOccupationListed;
    private assessSponsor;
}
