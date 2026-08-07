import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { UserPoints } from './entities/user-points.entity';
export declare class UserPointsRepository extends BaseRepository<UserPoints> {
    private readonly repo;
    constructor(repo: Repository<UserPoints>);
    findAllByUserId(userId: string): Promise<UserPoints[]>;
    findLatestByUserId(userId: string): Promise<UserPoints | null>;
    findRecentByUserId(userId: string, limit: number): Promise<UserPoints[]>;
}
