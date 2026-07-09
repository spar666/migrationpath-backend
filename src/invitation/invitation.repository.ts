import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Invitation } from './entities/invitation.entity';

@Injectable()
export class InvitationRepository extends BaseRepository<Invitation> {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {
    super(invitationRepository);
  }

  async findLatest(limit = 50): Promise<Invitation[]> {
    return this.repository.find({
      order: { created_at: 'DESC' } as any,
      take: limit,
    });
  }
}
