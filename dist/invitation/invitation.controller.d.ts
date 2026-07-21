import { InvitationService } from './invitation.service';
import { CreateInvitationDto, UpdateInvitationDto } from './dto/create-invitation.dto';
export declare class InvitationController {
    private readonly invitationService;
    constructor(invitationService: InvitationService);
    getFeed(): Promise<import("./entities/invitation.entity").Invitation[]>;
    create(dto: CreateInvitationDto): Promise<import("./entities/invitation.entity").Invitation>;
    update(id: string, dto: UpdateInvitationDto): Promise<import("./entities/invitation.entity").Invitation>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
