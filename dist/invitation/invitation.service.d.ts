import { InvitationRepository } from './invitation.repository';
import { CreateInvitationDto, UpdateInvitationDto } from './dto/create-invitation.dto';
import { Invitation } from './entities/invitation.entity';
export declare class InvitationService {
    private readonly invitationRepo;
    constructor(invitationRepo: InvitationRepository);
    getFeed(): Promise<Invitation[]>;
    create(dto: CreateInvitationDto): Promise<Invitation>;
    update(id: string, dto: UpdateInvitationDto): Promise<Invitation>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
