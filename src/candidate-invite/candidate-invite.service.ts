import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ProspectService } from '../prospect/prospect.service';
import {
  AcceptCandidateInviteDto,
  CreateCandidateInviteDto,
} from './dto/candidate-invite.dto';
import { CandidateInvite } from './entities/candidate-invite.entity';

@Injectable()
export class CandidateInviteService {
  constructor(
    @InjectRepository(CandidateInvite)
    private readonly repo: Repository<CandidateInvite>,
    private readonly prospects: ProspectService,
  ) {}

  async create(dto: CreateCandidateInviteDto) {
    const business = await this.prospects.findById(dto.business_prospect_id);
    if (
      business.human_ref.toUpperCase() !==
        dto.business_reference.trim().toUpperCase() ||
      business.party !== 'business'
    )
      throw new NotFoundException('Business prospect not found');
    const email = dto.candidate_email.trim().toLowerCase();
    const existing = await this.repo.findOne({
      where: {
        business_prospect_id: business.id,
        candidate_email: email,
        status: 'pending',
      },
    });
    if (existing && existing.expires_at > new Date())
      return { invite_id: existing.id, status: existing.status, reused: true };
    const token = randomBytes(32).toString('hex');
    const invite = await this.repo.save(
      this.repo.create({
        business_prospect_id: business.id,
        candidate_name: dto.candidate_name,
        candidate_email: email,
        candidate_nationality: dto.candidate_nationality,
        token_hash: this.hash(token),
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 86400000),
      }),
    );
    return {
      invite_id: invite.id,
      status: invite.status,
      token,
      reused: false,
    };
  }

  async accept(dto: AcceptCandidateInviteDto) {
    const invite = await this.repo.findOne({
      where: { token_hash: this.hash(dto.token) },
    });
    if (!invite || invite.status !== 'pending')
      throw new NotFoundException('Invitation not found');
    if (invite.expires_at <= new Date()) {
      await this.repo.update(invite.id, { status: 'expired' });
      throw new BadRequestException('Invitation has expired');
    }
    const existing = await this.repo.findOne({ where: { id: invite.id } });
    if (!existing) throw new NotFoundException('Invitation not found');
    const prospect = await this.prospects.create({
      party: 'applicant',
      full_name: invite.candidate_name,
      email: invite.candidate_email,
      source: 'candidate_invite',
      stage: 'captured',
      consent_given: true,
      consent_text: dto.consent_text,
      consent_at: new Date(),
      captured_answers: {
        nationality: invite.candidate_nationality,
        invited_by_prospect_id: invite.business_prospect_id,
      },
    });
    await this.repo.update(invite.id, {
      status: 'accepted',
      applicant_prospect_id: prospect.id,
    });
    return { prospect_id: prospect.id, human_ref: prospect.human_ref };
  }

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
