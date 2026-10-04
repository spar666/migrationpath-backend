import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProspectModule } from '../prospect/prospect.module';
import { CandidateInviteController } from './candidate-invite.controller';
import { CandidateInviteService } from './candidate-invite.service';
import { CandidateInvite } from './entities/candidate-invite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateInvite]), ProspectModule],
  controllers: [CandidateInviteController],
  providers: [CandidateInviteService],
})
export class CandidateInviteModule {}
