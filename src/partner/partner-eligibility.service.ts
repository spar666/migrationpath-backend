import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerEligibilitySubmission } from './entities/partner-eligibility-submission.entity';
import {
  PartnerEligibilityEngine,
  EligibilityResult,
} from './partner-eligibility.engine';
import { PartnerEligibilityDto } from './dto/partner-eligibility.dto';
import { LeadsService } from '../leads/leads.service';

export interface PartnerEligibilityResponse extends EligibilityResult {
  id: string;
  applicantFirstName: string;
  sponsorFirstName: string;
}

@Injectable()
export class PartnerEligibilityService {
  private readonly logger = new Logger(PartnerEligibilityService.name);

  constructor(
    @InjectRepository(PartnerEligibilitySubmission)
    private readonly submissions: Repository<PartnerEligibilitySubmission>,
    private readonly engine: PartnerEligibilityEngine,
    private readonly leadsService: LeadsService,
  ) {}

  async submit(dto: PartnerEligibilityDto): Promise<PartnerEligibilityResponse> {
    const result = this.engine.assess(dto);

    const saved = await this.submissions.save(
      this.submissions.create({
        applicantFirstName: dto.applicantFirstName,
        sponsorFirstName: dto.sponsorFirstName,
        completedBy: dto.completedBy,
        email: dto.email,
        applicantCountry: dto.applicantCountry,
        relationshipStatus: dto.relationshipStatus,
        outcome: result.outcome,
        summary: result.summary,
        effort: result.effort,
        highRisk: result.highRisk,
        becomingEligible: result.becomingEligible,
        answers: dto as unknown as Record<string, unknown>,
      }),
    );

    this.logger.log(
      `Partner eligibility submission ${saved.id}: ${result.summary} / ${result.effort}`,
    );

    // Also register the submission as a lead so it shows up in the admin
    // Leads panel and triggers the usual new-lead notifications. Lead
    // capture must never fail the quiz response itself.
    this.leadsService
      .create({
        full_name: `${dto.applicantFirstName} & ${dto.sponsorFirstName}`,
        email: dto.email,
        visa_type: 'Partner visa (820/801/309/100/300)',
        message:
          `Partner eligibility quiz — ${result.summary} (${result.effort}). ` +
          `Completed by: ${dto.completedBy}. ` +
          `Applicant country: ${dto.applicantCountry}. ` +
          `Relationship: ${dto.relationshipStatus}. ` +
          `Submission: ${saved.id}`,
        source: 'partner_eligibility',
      })
      .catch((error) => {
        this.logger.error(
          `Failed to create lead for eligibility submission ${saved.id}: ${error.message}`,
        );
      });

    return {
      id: saved.id,
      applicantFirstName: saved.applicantFirstName,
      sponsorFirstName: saved.sponsorFirstName,
      ...result,
    };
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.submissions.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
