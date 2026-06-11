import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { InvitationRepository } from './invitation.repository';
import { Invitation } from './entities/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation])],
  controllers: [InvitationController],
  providers: [InvitationService, InvitationRepository],
  exports: [InvitationService, InvitationRepository],
})
export class InvitationModule {}
