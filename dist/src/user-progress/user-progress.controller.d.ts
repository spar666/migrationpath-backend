import { UserProgressService } from './user-progress.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
export declare class UserProgressController {
    private readonly progressService;
    constructor(progressService: UserProgressService);
    getMyProgress(user: AuthUser): Promise<import("./entities/user-progress.entity").UserProgress[]>;
    getOne(user: AuthUser, id: string): Promise<import("./entities/user-progress.entity").UserProgress>;
    create(user: AuthUser, dto: SaveProgressDto): Promise<import("./entities/user-progress.entity").UserProgress>;
    update(user: AuthUser, id: string, dto: UpdateProgressDto): Promise<import("./entities/user-progress.entity").UserProgress>;
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
