import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Sponsor } from './entities/sponsor.entity';

@Injectable()
export class SponsorRepository extends BaseRepository<Sponsor> {
  constructor(
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
  ) {
    super(sponsorRepository);
  }

  findByProspectId(prospectId: string): Promise<Sponsor | null> {
    return this.sponsorRepository.findOne({
      where: { prospect_id: prospectId },
      order: { created_at: 'DESC' },
    });
  }

  findWithNominations(sponsorId: string): Promise<Sponsor | null> {
    return this.sponsorRepository.findOne({
      where: { id: sponsorId },
      relations: ['nominations'],
    });
  }
}
