import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CandidateInviteService } from './candidate-invite.service';
import {
  AcceptCandidateInviteDto,
  CreateCandidateInviteDto,
} from './dto/candidate-invite.dto';

@Controller('candidate-invites')
export class CandidateInviteController {
  constructor(private readonly service: CandidateInviteService) {}
  @Post() @Throttle({ default: { limit: 5, ttl: 60000 } }) create(
    @Body() dto: CreateCandidateInviteDto,
  ) {
    return this.service.create(dto);
  }
  @Post('accept') @Throttle({ default: { limit: 5, ttl: 60000 } }) accept(
    @Body() dto: AcceptCandidateInviteDto,
  ) {
    return this.service.accept(dto);
  }
}
