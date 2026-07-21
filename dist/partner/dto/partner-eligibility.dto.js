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
exports.PartnerEligibilityDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PartnerEligibilityDto {
    applicantFirstName;
    sponsorFirstName;
    completedBy;
    englishNative;
    interpreterNeed;
    interpreterLanguage;
    applicantCountry;
    applicantState;
    visaExpired;
    substantiveVisa;
    currentVisaTypeDetails;
    visaExpiryDate;
    planningNewVisaSoon;
    visaExpiredDetails;
    arrivedOnPMV;
    sponsorWasPMVSponsor;
    stillWithPMVSponsor;
    pmvRelationshipEndDate;
    pmvPreviousSponsorCircumstances;
    pmvCeased;
    marriedBeforePMVCeased;
    applicantLegalStatus;
    applicantLegalStatusDetails;
    sponsorResidencyStatus;
    sponsorPrPathway;
    sponsorPartnerVisaApplicationDate;
    sponsorParentVisaGrantDate;
    sponsorVisitingVisaDetails;
    sponsorStatusExplanation;
    sponsorCountry;
    sponsorPreviouslySponsored;
    previousSponsorshipEnded;
    previousSponsorshipCount;
    previousSponsorshipLodgedDate;
    visaIssues;
    criminalOffences;
    techComfort;
    relationshipStatus;
    marriageDate;
    engagementDate;
    intendedMarriageDate;
    datingStartDate;
    willingToMarry;
    exclusiveRelationship;
    nonExclusiveExplanation;
    liveTogetherNow;
    livedTogetherBefore;
    livingTogetherSince;
    apartOverMonth;
    apartReasons;
    willingToLiveTogether;
    neverLivedTogetherReasons;
    neverLivedTogetherOther;
    metInPerson;
    arrangedMarriage;
    neverMetExplanation;
    additionalMigratingMembers;
    seriousHealthConditions;
    bothOver18;
    under18Explanation;
    hearAboutUs;
    hearAboutUsOther;
    referred;
    referralCode;
    email;
}
exports.PartnerEligibilityDto = PartnerEligibilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Applicant first name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "applicantFirstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sponsor first name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorFirstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Applicant', 'Sponsor'] }),
    (0, class_validator_1.IsIn)(['Applicant', 'Sponsor']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "completedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "englishNative", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "interpreterNeed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "interpreterLanguage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country the applicant currently lives in' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "applicantCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Australian state/territory (onshore only)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "applicantState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Has the applicant's Australian visa expired?" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "visaExpired", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Is the applicant's visa a substantive visa?" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "substantiveVisa", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "currentVisaTypeDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current visa expiry date (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "visaExpiryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Planning to apply for a new Australian visa within 6 months?',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "planningNewVisaSoon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "visaExpiredDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "arrivedOnPMV", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorWasPMVSponsor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "stillWithPMVSponsor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "pmvRelationshipEndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], PartnerEligibilityDto.prototype, "pmvPreviousSponsorCircumstances", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "pmvCeased", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "marriedBeforePMVCeased", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Legal status in country of residence (offshore only)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "applicantLegalStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "applicantLegalStatusDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Sponsor's Australian residency status" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorResidencyStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'How the sponsor obtained permanent residency' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorPrPathway", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorPartnerVisaApplicationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorParentVisaGrantDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorVisitingVisaDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorStatusExplanation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "sponsorPreviouslySponsored", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "previousSponsorshipEnded", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['1', '2 or more']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "previousSponsorshipCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "previousSponsorshipLodgedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "visaIssues", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "criminalOffences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "techComfort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Relationship between applicant and sponsor' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "relationshipStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "marriageDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "engagementDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "intendedMarriageDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "datingStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "willingToMarry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "exclusiveRelationship", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "nonExclusiveExplanation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "liveTogetherNow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "livedTogetherBefore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "livingTogetherSince", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "apartOverMonth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], PartnerEligibilityDto.prototype, "apartReasons", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "willingToLiveTogether", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], PartnerEligibilityDto.prototype, "neverLivedTogetherReasons", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "neverLivedTogetherOther", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "metInPerson", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No', 'Not sure']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "arrangedMarriage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "neverMetExplanation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['0', '1', '2 or more']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "additionalMigratingMembers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "seriousHealthConditions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "bothOver18", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "under18Explanation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "hearAboutUs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "hearAboutUsOther", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Yes', 'No']),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "referred", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "referralCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], PartnerEligibilityDto.prototype, "email", void 0);
//# sourceMappingURL=partner-eligibility.dto.js.map