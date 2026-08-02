import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Nomination } from './entities/nomination.entity';

@Injectable()
export class NominationRepository extends BaseRepository<Nomination> {
  constructor(
    @InjectRepository(Nomination)
    private readonly nominationRepository: Repository<Nomination>,
  ) {
    super(nominationRepository);
  }

  findBySponsorId(sponsorId: string): Promise<Nomination[]> {
    return this.nominationRepository.find({
      where: { sponsor_id: sponsorId },
      order: { created_at: 'DESC' },
    });
  }

  findByApplicantProspectId(prospectId: string): Promise<Nomination[]> {
    return this.nominationRepository.find({
      where: { applicant_prospect_id: prospectId },
      order: { created_at: 'DESC' },
    });
  }

  /** Roles still waiting on a candidate — the agent's matching queue. */
  findOpen(): Promise<Nomination[]> {
    return this.nominationRepository.find({
      where: { status: 'open', applicant_prospect_id: null as any },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Match an applicant-party prospect to a role. This is the join that closes
   * the two-sided funnel; it is an agent action, never a public one.
   */
  async matchApplicant(
    nominationId: string,
    applicantProspectId: string,
  ): Promise<Nomination> {
    await this.nominationRepository.update(nominationId, {
      applicant_prospect_id: applicantProspectId,
      status: 'matched',
    });
    return this.findById(nominationId);
  }
}
