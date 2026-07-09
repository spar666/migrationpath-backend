import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { InvitationTrend, StateNomination } from './entities/analytics.entity';

@Injectable()
export class TrendsRepository extends BaseRepository<InvitationTrend> {
  constructor(
    @InjectRepository(InvitationTrend)
    private readonly trendRepository: Repository<InvitationTrend>,
  ) {
    super(trendRepository);
  }

  async findByOccupation(anzscoCode: string): Promise<InvitationTrend[]> {
    return this.findAll({ anzsco_code: anzscoCode });
  }
}

@Injectable()
export class StateNominationsRepository extends BaseRepository<StateNomination> {
  constructor(
    @InjectRepository(StateNomination)
    private readonly stateNominationRepository: Repository<StateNomination>,
  ) {
    super(stateNominationRepository);
  }

  async findByState(
    stateCode: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT',
  ): Promise<StateNomination[]> {
    return this.findAll({ state_code: stateCode });
  }
}
