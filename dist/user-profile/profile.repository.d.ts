import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Profile } from './entities/profile.entity';
export declare class ProfileRepository extends BaseRepository<Profile> {
    private readonly profileRepository;
    constructor(profileRepository: Repository<Profile>);
    findByUserId(userId: string): Promise<Profile>;
    updateByUserId(userId: string, data: Partial<Profile>): Promise<Profile>;
}
