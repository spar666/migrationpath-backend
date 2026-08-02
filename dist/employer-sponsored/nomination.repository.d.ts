import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Nomination } from './entities/nomination.entity';
export declare class NominationRepository extends BaseRepository<Nomination> {
    private readonly nominationRepository;
    constructor(nominationRepository: Repository<Nomination>);
    findBySponsorId(sponsorId: string): Promise<Nomination[]>;
    findByApplicantProspectId(prospectId: string): Promise<Nomination[]>;
    findOpen(): Promise<Nomination[]>;
    matchApplicant(nominationId: string, applicantProspectId: string): Promise<Nomination>;
}
