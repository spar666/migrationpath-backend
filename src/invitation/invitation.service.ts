import { Injectable } from '@nestjs/common';
import { InvitationRepository } from './invitation.repository';
import {
  CreateInvitationDto,
  UpdateInvitationDto,
} from './dto/create-invitation.dto';
import { Invitation } from './entities/invitation.entity';

@Injectable()
export class InvitationService {
  constructor(private readonly invitationRepo: InvitationRepository) {}

  async getFeed(): Promise<Invitation[]> {
    return this.invitationRepo.findLatest();
  }

  async create(dto: CreateInvitationDto): Promise<Invitation> {
    return this.invitationRepo.create(dto);
  }

  async update(id: string, dto: UpdateInvitationDto): Promise<Invitation> {
    return this.invitationRepo.update(id, dto);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.invitationRepo.delete(id);
    return { success: true };
  }
}
