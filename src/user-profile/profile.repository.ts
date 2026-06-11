import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileRepository extends BaseRepository<Profile> {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {
    super(profileRepository);
  }

  async findByUserId(userId: string): Promise<Profile> {
    return this.findById(userId);
  }

  async updateByUserId(
    userId: string,
    data: Partial<Profile>,
  ): Promise<Profile> {
    return this.update(userId, data);
  }
}
