import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Invitation } from './entities/invitation.entity';
export declare class InvitationRepository extends BaseRepository<Invitation> {
    private readonly invitationRepository;
    constructor(invitationRepository: Repository<Invitation>);
    findLatest(limit?: number): Promise<Invitation[]>;
}
