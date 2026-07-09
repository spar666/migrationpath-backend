import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { UserProgress } from './entities/user-progress.entity';

@Injectable()
export class UserProgressRepository extends BaseRepository<UserProgress> {
  constructor(
    @InjectRepository(UserProgress)
    private readonly repo: Repository<UserProgress>,
  ) {
    super(repo);
  }

  /** All progress records for a given user, newest first */
  async findAllByUserId(userId: string): Promise<UserProgress[]> {
    return this.repo.find({
      where: { user_id: userId },
      order: { updated_at: 'DESC' },
    });
  }

  /** Single progress record owned by a specific user */
  async findOneByUserAndId(
    userId: string,
    id: string,
  ): Promise<UserProgress | null> {
    return this.repo.findOne({ where: { id, user_id: userId } });
  }

  /** Delete a progress record, enforcing ownership */
  async deleteByUserAndId(userId: string, id: string): Promise<void> {
    await this.repo.delete({ id, user_id: userId });
  }
}
