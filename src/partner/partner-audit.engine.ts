import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerAudit } from './entities/partner-audit.entity';
import {
  PartnerProfileDto,
  ApplicantLocation,
} from './dto/partner-profile.dto';
import {
  PartnerAuditResultDto,
  PillarResult,
  PredictedVisa,
  CommitmentStatus,
} from './dto/partner-audit-result.dto';
import { PolicyConfigService } from '../policy-config/policy-config.service';

const num = PolicyConfigService.num;

@Injectable()
export class PartnerAuditEngine {
  constructor(
    @InjectRepository(PartnerAudit)
    private readonly auditRepository: Repository<PartnerAudit>,
    private readonly policyConfig: PolicyConfigService,
  ) {}

  async calculatePartnerReadiness(
    profile: PartnerProfileDto,
  ): Promise<PartnerAuditResultDto> {
    // All weights/thresholds are admin-editable; the fallbacks match the
    // originally hard-coded values, so scoring is identical until an admin edits.
    const cfg = await this.policyConfig.snapshot();
    const pillarMax = num(cfg, 'partner.pillarMax', 100);
    const weakThreshold = num(cfg, 'partner.weakThreshold', 75);
    const form888Required = num(cfg, 'partner.form888Required', 2);

    const cap = (value: number) => Math.max(0, Math.min(value, pillarMax));

    const p = {
      jointBankAccounts: !!profile.jointBankAccounts,
      jointLeaseOrMortgage: !!profile.jointLeaseOrMortgage,
      sharedUtilityBills: !!profile.sharedUtilityBills,
      sharedDomesticBills: !!profile.sharedDomesticBills,
      jointChildResponsibility: !!profile.jointChildResponsibility,
      matchingAddressHistory: !!profile.matchingAddressHistory,
      sharedTravelItineraries: !!profile.sharedTravelItineraries,
      form888Count: profile.form888Count ?? 0,
      jointSocialInvitations: !!profile.jointSocialInvitations,
      livedTogether12Months: !!profile.livedTogether12Months,
      registeredRelationshipBDM: !!profile.registeredRelationshipBDM,
    };

    const financialScore = cap(
      (p.jointBankAccounts ? num(cfg, 'partner.jointBankAccounts', 30) : 0) +
        (p.jointLeaseOrMortgage ? num(cfg, 'partner.jointLeaseOrMortgage', 40) : 0) +
        (p.sharedUtilityBills ? num(cfg, 'partner.sharedUtilityBills', 30) : 0),
    );

    const householdScore = cap(
      (p.sharedDomesticBills ? num(cfg, 'partner.sharedDomesticBills', 40) : 0) +
        (p.jointChildResponsibility ? num(cfg, 'partner.jointChildResponsibility', 30) : 0) +
        (p.matchingAddressHistory ? num(cfg, 'partner.matchingAddressHistory', 30) : 0),
    );

    const hasForm888 = p.form888Count >= form888Required;
    const socialScore = cap(
      (p.sharedTravelItineraries ? num(cfg, 'partner.sharedTravelItineraries', 30) : 0) +
        (hasForm888 ? num(cfg, 'partner.form888Points', 40) : 0) +
        (p.jointSocialInvitations ? num(cfg, 'partner.jointSocialInvitations', 30) : 0),
    );

    const commitmentScore = cap(
      (p.livedTogether12Months ? num(cfg, 'partner.livedTogether12Months', 50) : 0) +
        (p.registeredRelationshipBDM ? num(cfg, 'partner.registeredRelationshipBDM', 50) : 0),
    );

    const legislativeWaiverApplied =
      !p.livedTogether12Months && p.registeredRelationshipBDM;
    const commitmentStatus: CommitmentStatus = legislativeWaiverApplied
      ? 'LEGALLY UNLOCKED'
      : 'STANDARD';

    const pillars: PillarResult[] = [
      { key: 'financial', label: 'Financial Aspects', score: financialScore, percentage: financialScore, status: 'STANDARD' },
      { key: 'household', label: 'Nature of Household', score: householdScore, percentage: householdScore, status: 'STANDARD' },
      { key: 'social', label: 'Social Aspects', score: socialScore, percentage: socialScore, status: 'STANDARD' },
      { key: 'commitment', label: 'Commitment Aspects', score: commitmentScore, percentage: commitmentScore, status: commitmentStatus },
    ];

    const overallReadiness = Math.round(
      pillars.reduce((sum, pillar) => sum + pillar.percentage, 0) /
        pillars.length,
    );

    const predictedVisa = this.resolveVisaPath(profile.currentLocation);

    const recommendations = this.buildRecommendations(
      p,
      { financialScore, householdScore, socialScore, commitmentScore },
      legislativeWaiverApplied,
      weakThreshold,
      form888Required,
    );

    const entity = this.auditRepository.create({
      currentLocation: profile.currentLocation,
      jointBankAccounts: p.jointBankAccounts,
      jointLeaseOrMortgage: p.jointLeaseOrMortgage,
      sharedUtilityBills: p.sharedUtilityBills,
      sharedDomesticBills: p.sharedDomesticBills,
      jointChildResponsibility: p.jointChildResponsibility,
      matchingAddressHistory: p.matchingAddressHistory,
      sharedTravelItineraries: p.sharedTravelItineraries,
      form888Count: p.form888Count,
      jointSocialInvitations: p.jointSocialInvitations,
      livedTogether12Months: p.livedTogether12Months,
      registeredRelationshipBDM: p.registeredRelationshipBDM,
      overallReadiness,
      financialScore,
      householdScore,
      socialScore,
      commitmentScore,
      commitmentStatus,
      legislativeWaiverApplied,
      predictedSubclass: predictedVisa.subclass,
      recommendations,
    });
    const saved = await this.auditRepository.save(entity);

    return {
      auditId: saved.id,
      overallReadiness,
      pillars,
      predictedVisa,
      legislativeWaiverApplied,
      commitmentStatus,
      recommendations,
    };
  }

  private resolveVisaPath(location: ApplicantLocation): PredictedVisa {
    if (location === ApplicantLocation.ONSHORE) {
      return { subclass: '820', name: 'Partner visa (Onshore, 820/801)', location: 'onshore' };
    }
    return { subclass: '309', name: 'Partner visa (Offshore, 309/100)', location: 'offshore' };
  }

  private buildRecommendations(
    p: {
      jointBankAccounts: boolean;
      jointLeaseOrMortgage: boolean;
      sharedUtilityBills: boolean;
      sharedDomesticBills: boolean;
      jointChildResponsibility: boolean;
      matchingAddressHistory: boolean;
      sharedTravelItineraries: boolean;
      form888Count: number;
      jointSocialInvitations: boolean;
      livedTogether12Months: boolean;
      registeredRelationshipBDM: boolean;
    },
    scores: {
      financialScore: number;
      householdScore: number;
      socialScore: number;
      commitmentScore: number;
    },
    legislativeWaiverApplied: boolean,
    weakThreshold: number,
    form888Required: number,
  ): string[] {
    const recs: string[] = [];

    if (scores.financialScore < weakThreshold) {
      if (!p.jointLeaseOrMortgage) recs.push('Financial: add both partners to a lease or mortgage — joint property commitments are the strongest financial evidence.');
      if (!p.jointBankAccounts) recs.push('Financial: open a joint bank account and use it for shared expenses to demonstrate pooled finances.');
      if (!p.sharedUtilityBills) recs.push('Financial: put utility accounts in both names, or retain bills showing shared liability.');
    }

    if (scores.householdScore < weakThreshold) {
      if (!p.sharedDomesticBills) recs.push('Household: keep records of shared domestic bills and how household costs are divided between you.');
      if (!p.matchingAddressHistory) recs.push('Household: build a consistent shared address history (licences, mail, electoral roll) at the same residence.');
      if (!p.jointChildResponsibility) recs.push('Household: if you share care of children, document joint responsibility (school records, medical, guardianship).');
    }

    if (scores.socialScore < weakThreshold) {
      if (p.form888Count < form888Required) recs.push(`Social: obtain at least ${form888Required} Form 888 statutory declarations from Australian citizens or permanent residents (you currently have ${p.form888Count}).`);
      if (!p.sharedTravelItineraries) recs.push('Social: keep joint travel itineraries and booking records showing you travel together.');
      if (!p.jointSocialInvitations) recs.push('Social: retain invitations and evidence addressed to you as a couple to show you are recognised socially.');
    }

    if (legislativeWaiverApplied) {
      recs.push('Commitment: your BDM-registered relationship satisfies the 12-month cohabitation requirement — the low-cohabitation risk is waived. Keep the registration certificate accessible.');
    } else if (scores.commitmentScore < weakThreshold) {
      if (!p.livedTogether12Months && !p.registeredRelationshipBDM) {
        recs.push('Commitment: you have neither 12+ months of cohabitation nor a registered relationship. Register your de facto relationship with a State/Territory BDM to legally satisfy the cohabitation requirement.');
      } else if (!p.livedTogether12Months) {
        recs.push('Commitment: strengthen the commitment pillar with evidence of shared living arrangements approaching 12 months.');
      }
    }

    if (recs.length === 0) {
      recs.push('Your evidence is strong across all four pillars. Focus on organising and certifying documents ahead of lodgement.');
    }

    return recs;
  }
}
