import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserProgressRepository } from './user-progress.repository';
import { SaveProgressDto } from './dto/save-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UserProgress } from './entities/user-progress.entity';

@Injectable()
export class UserProgressService {
  constructor(private readonly progressRepo: UserProgressRepository) {}

  /** Return all saved progress entries for the authenticated user */
  async getMyProgress(userId: string): Promise<UserProgress[]> {
    return this.progressRepo.findAllByUserId(userId);
  }

  /** Return a single progress entry owned by the authenticated user */
  async getOne(userId: string, id: string): Promise<UserProgress> {
    const record = await this.progressRepo.findOneByUserAndId(userId, id);
    if (!record) throw new NotFoundException('Progress record not found');
    return record;
  }

  /**
   * Create a new progress record for the user.
   * Data comes from the search page or view-details page.
   */
  async create(userId: string, dto: SaveProgressDto): Promise<UserProgress> {
    return this.progressRepo.create({ ...dto, user_id: userId });
  }

  /**
   * Update an existing progress record (e.g. user advanced a step or
   * the points calculator produced a new score).
   */
  async update(
    userId: string,
    id: string,
    dto: UpdateProgressDto,
  ): Promise<UserProgress> {
    const record = await this.progressRepo.findOneByUserAndId(userId, id);
    if (!record) throw new NotFoundException('Progress record not found');

    // Merge JSONB data instead of replacing it wholesale
    const mergedData = { ...(record.data || {}), ...(dto.data || {}) };
    return this.progressRepo.update(id, { ...dto, data: mergedData });
  }

  /** Delete a saved progress entry */
  async remove(userId: string, id: string): Promise<{ message: string }> {
    const record = await this.progressRepo.findOneByUserAndId(userId, id);
    if (!record) throw new NotFoundException('Progress record not found');
    await this.progressRepo.deleteByUserAndId(userId, id);
    return { message: 'Progress deleted successfully' };
  }
}
