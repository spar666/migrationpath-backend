import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadsRepository extends BaseRepository<Lead> {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {
    super(leadRepository);
  }
}
