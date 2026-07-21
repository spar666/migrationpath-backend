import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { UserProgress } from './entities/user-progress.entity';
export declare class UserProgressRepository extends BaseRepository<UserProgress> {
    private readonly repo;
    constructor(repo: Repository<UserProgress>);
    findAllByUserId(userId: string): Promise<UserProgress[]>;
    findOneByUserAndId(userId: string, id: string): Promise<UserProgress | null>;
    deleteByUserAndId(userId: string, id: string): Promise<void>;
}
