import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Prospect } from './entities/prospect.entity';
export declare class ProspectRepository extends BaseRepository<Prospect> {
    private readonly prospectRepository;
    constructor(prospectRepository: Repository<Prospect>);
    findByHumanRef(humanRef: string): Promise<Prospect | null>;
    findByEmail(email: string): Promise<Prospect | null>;
    findOneById(id: string): Promise<Prospect | null>;
    humanRefExists(humanRef: string): Promise<boolean>;
}
