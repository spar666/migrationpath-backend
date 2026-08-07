import { UserProgressRepository } from './user-progress.repository';
import { SaveProgressDto } from './dto/save-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UserProgress } from './entities/user-progress.entity';
export declare class UserProgressService {
    private readonly progressRepo;
    constructor(progressRepo: UserProgressRepository);
    getMyProgress(userId: string): Promise<UserProgress[]>;
    getOne(userId: string, id: string): Promise<UserProgress>;
    create(userId: string, dto: SaveProgressDto): Promise<UserProgress>;
    update(userId: string, id: string, dto: UpdateProgressDto): Promise<UserProgress>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
