import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Prospect } from './entities/prospect.entity';

@Injectable()
export class ProspectRepository extends BaseRepository<Prospect> {
  constructor(
    @InjectRepository(Prospect)
    private readonly prospectRepository: Repository<Prospect>,
  ) {
    super(prospectRepository);
  }

  findByHumanRef(humanRef: string): Promise<Prospect | null> {
    return this.prospectRepository.findOne({
      where: { human_ref: humanRef.toUpperCase() },
    });
  }

  findByEmail(email: string): Promise<Prospect | null> {
    return this.prospectRepository.findOne({
      where: { email: email.toLowerCase() },
      order: { created_at: 'DESC' },
    });
  }

  findOneById(id: string): Promise<Prospect | null> {
    return this.prospectRepository.findOne({ where: { id } });
  }

  humanRefExists(humanRef: string): Promise<boolean> {
    return this.prospectRepository
      .count({ where: { human_ref: humanRef } })
      .then((c) => c > 0);
  }
}
