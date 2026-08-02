"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitPreScreenDto = exports.PreScreenBusinessDto = exports.PreScreenNominationDto = exports.PreScreenSponsorDto = exports.PreScreenApplicantDto = exports.PreScreenContactDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PreScreenContactDto {
    full_name;
    email;
    phone;
    consent_given;
    consent_text;
}
exports.PreScreenContactDto = PreScreenContactDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], PreScreenContactDto.prototype, "full_name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], PreScreenContactDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], PreScreenContactDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PreScreenContactDto.prototype, "consent_given", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], PreScreenContactDto.prototype, "consent_text", void 0);
class PreScreenApplicantDto {
    age;
    occupation_code;
    occupation_name;
    occupation_listed;
    years_experience;
    english_overall;
    english_lowest_band;
    has_skills_assessment;
    onshore;
    current_visa;
    has_health_or_character_concern;
    preferred_subclass;
}
exports.PreScreenApplicantDto = PreScreenApplicantDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], PreScreenApplicantDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(12),
    __metadata("design:type", String)
], PreScreenApplicantDto.prototype, "occupation_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], PreScreenApplicantDto.prototype, "occupation_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PreScreenApplicantDto.prototype, "occupation_listed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], PreScreenApplicantDto.prototype, "years_experience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(9),
    __metadata("design:type", Number)
], PreScreenApplicantDto.prototype, "english_overall", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(9),
    __metadata("design:type", Number)
], PreScreenApplicantDto.prototype, "english_lowest_band", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PreScreenApplicantDto.prototype, "has_skills_assessment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PreScreenApplicantDto.prototype, "onshore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], PreScreenApplicantDto.prototype, "current_visa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PreScreenApplicantDto.prototype, "has_health_or_character_concern", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(8),
    __metadata("design:type", String)
], PreScreenApplicantDto.prototype, "preferred_subclass", void 0);
class PreScreenSponsorDto {
    legal_name;
    trading_name;
    abn;
    industry;
    employee_count;
    years_trading;
    state;
    postcode;
    sponsorship_status;
    has_adverse_information;
    meets_training_obligations;
}
exports.PreScreenSponsorDto = PreScreenSponsorDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], PreScreenSponsorDto.prototype, "legal_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], PreScreenSponsorDto.prototype, "trading_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], PreScreenSponsorDto.prototype, "abn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], PreScreenSponsorDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PreScreenSponsorDto.prototype, "employee_count", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PreScreenSponsorDto.prototype, "years_trading", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], PreScreenSponsorDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], PreScreenSponsorDto.prototype, "postcode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['prospective', 'approved', 'lapsed', 'refused', 'unknown']),
    __metadata("design:type", String)
], PreScreenSponsorDto.prototype, "sponsorship_status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PreScreenSponsorDto.prototype, "has_adverse_information", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PreScreenSponsorDto.prototype, "meets_training_obligations", void 0);
class PreScreenNominationDto {
    occupation_code;
    occupation_name;
    subclass;
    annual_salary;
    work_state;
    work_postcode;
    is_regional;
    lmt_completed;
}
exports.PreScreenNominationDto = PreScreenNominationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(12),
    __metadata("design:type", String)
], PreScreenNominationDto.prototype, "occupation_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], PreScreenNominationDto.prototype, "occupation_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(8),
    __metadata("design:type", String)
], PreScreenNominationDto.prototype, "subclass", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PreScreenNominationDto.prototype, "annual_salary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], PreScreenNominationDto.prototype, "work_state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], PreScreenNominationDto.prototype, "work_postcode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PreScreenNominationDto.prototype, "is_regional", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PreScreenNominationDto.prototype, "lmt_completed", void 0);
class PreScreenBusinessDto {
    sponsor;
    nomination;
    candidate;
}
exports.PreScreenBusinessDto = PreScreenBusinessDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PreScreenSponsorDto),
    __metadata("design:type", PreScreenSponsorDto)
], PreScreenBusinessDto.prototype, "sponsor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PreScreenNominationDto),
    __metadata("design:type", PreScreenNominationDto)
], PreScreenBusinessDto.prototype, "nomination", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PreScreenApplicantDto),
    __metadata("design:type", PreScreenApplicantDto)
], PreScreenBusinessDto.prototype, "candidate", void 0);
class SubmitPreScreenDto {
    party;
    contact;
    applicant;
    business;
    sponsoring_employer;
    offered_role;
    raw_answers;
    source;
}
exports.SubmitPreScreenDto = SubmitPreScreenDto;
__decorate([
    (0, class_validator_1.IsIn)(['applicant', 'business']),
    __metadata("design:type", String)
], SubmitPreScreenDto.prototype, "party", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PreScreenContactDto),
    __metadata("design:type", PreScreenContactDto)
], SubmitPreScreenDto.prototype, "contact", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PreScreenApplicantDto),
    __metadata("design:type", PreScreenApplicantDto)
], SubmitPreScreenDto.prototype, "applicant", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PreScreenBusinessDto),
    __metadata("design:type", PreScreenBusinessDto)
], SubmitPreScreenDto.prototype, "business", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PreScreenSponsorDto),
    __metadata("design:type", PreScreenSponsorDto)
], SubmitPreScreenDto.prototype, "sponsoring_employer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PreScreenNominationDto),
    __metadata("design:type", PreScreenNominationDto)
], SubmitPreScreenDto.prototype, "offered_role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SubmitPreScreenDto.prototype, "raw_answers", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(48),
    __metadata("design:type", String)
], SubmitPreScreenDto.prototype, "source", void 0);
//# sourceMappingURL=submit-pre-screen.dto.js.map