import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { UserPoints } from './entities/user-points.entity';

@Injectable()
export class UserPointsRepository extends BaseRepository<UserPoints> {
  constructor(
    @InjectRepository(UserPoints)
    private readonly repo: Repository<UserPoints>,
  ) {
    super(repo);
  }

  async findAllByUserId(userId: string): Promise<UserPoints[]> {
    return this.repo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findLatestByUserId(userId: string): Promise<UserPoints | null> {
    return this.repo.findOne({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findRecentByUserId(
    userId: string,
    limit: number,
  ): Promise<UserPoints[]> {
    return this.repo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
