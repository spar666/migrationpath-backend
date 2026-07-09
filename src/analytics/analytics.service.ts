import { Injectable } from '@nestjs/common';
import {
  TrendsRepository,
  StateNominationsRepository,
} from './analytics.repository';
import { InvitationTrend, StateNomination } from './entities/analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly trendsRepository: TrendsRepository,
    private readonly stateNominationsRepository: StateNominationsRepository,
  ) {}

  async getInvitationTrends(
    page: number,
    limit: number,
    filters?: any,
  ): Promise<any> {
    return this.trendsRepository.paginate(page, limit, filters);
  }

  async getStateNominations(): Promise<StateNomination[]> {
    return this.stateNominationsRepository.findAll();
  }
}
