import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Lead } from './entities/lead.entity';
export declare class LeadsRepository extends BaseRepository<Lead> {
    private readonly leadRepository;
    constructor(leadRepository: Repository<Lead>);
}
