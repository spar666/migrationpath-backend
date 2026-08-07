import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Sponsor } from './entities/sponsor.entity';
export declare class SponsorRepository extends BaseRepository<Sponsor> {
    private readonly sponsorRepository;
    constructor(sponsorRepository: Repository<Sponsor>);
    findByProspectId(prospectId: string): Promise<Sponsor | null>;
    findWithNominations(sponsorId: string): Promise<Sponsor | null>;
}
