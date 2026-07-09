import { Injectable } from '@nestjs/common';
import { UserPointsRepository } from './user-points.repository';
import { UserPoints } from './entities/user-points.entity';
import { SavePointsDto, CompareScenariosDto } from './dto/save-points.dto';
import { OccupationsService } from '../occupations/occupations.service';

@Injectable()
export class UserPointsService {
  constructor(
    private readonly repo: UserPointsRepository,
    // Occupation identity/name comes from the master.
    private readonly occupationsService: OccupationsService,
  ) {}

  async save(userId: string, dto: SavePointsDto): Promise<UserPoints> {
    const totalPoints =
      typeof dto.breakdown?.totalPoints === 'number'
        ? dto.breakdown.totalPoints
        : Object.values(dto.breakdown || {}).reduce(
            (sum: number, v: any) => sum + (typeof v === 'number' ? v : 0),
            0,
          );

    return this.repo.create({
      user_id: userId,
      persona_type: dto.personaType,
      total_points: totalPoints,
      breakdown: dto.breakdown,
      selections: dto.selections,
    });
  }

  async getLatest(userId: string): Promise<UserPoints | null> {
    return this.repo.findLatestByUserId(userId);
  }

  async getHistory(
    userId: string,
    limit: number = 10,
  ): Promise<
    { timestamp: string; totalPoints: number; breakdown: Record<string, any> }[]
  > {
    const records = await this.repo.findRecentByUserId(userId, limit);
    return records.map((r) => ({
      timestamp: r.created_at.toISOString(),
      totalPoints: r.total_points,
      breakdown: r.breakdown || {},
    }));
  }

  async compareScenarios(
    userId: string,
    dto: CompareScenariosDto,
  ): Promise<{ scenario: Record<string, any>; points: number }[]> {
    return dto.scenarios.map((scenario) => {
      const points = Object.values(scenario).reduce(
        (sum: number, v: any) => sum + (typeof v === 'number' ? v : 0),
        0,
      );
      return { scenario, points };
    });
  }

  async getOccupationPoints(anzscoCode: string): Promise<{
    anzscoCode: string;
    occupation: string;
    basePoints: number;
    modifiers: Record<string, number>;
  }> {
    // Resolve the canonical occupation name from the master (fallback to code).
    const nameMap = await this.occupationsService.getCanonicalNameMap([
      anzscoCode,
    ]);

    return {
      anzscoCode,
      occupation: nameMap[anzscoCode] ?? anzscoCode,
      basePoints: 60,
      modifiers: {
        state_nomination: 5,
        regional: 15,
        partner: 10,
        professional_year: 5,
      },
    };
  }

  async getEligibilityRanges(): Promise<
    {
      visaType: string;
      minimumPoints: number;
      averagePoints: number;
      percentilePoints: Record<string, number>;
    }[]
  > {
    return [
      {
        visaType: '189',
        minimumPoints: 65,
        averagePoints: 85,
        percentilePoints: { p50: 80, p75: 90, p90: 100 },
      },
      {
        visaType: '190',
        minimumPoints: 65,
        averagePoints: 80,
        percentilePoints: { p50: 75, p75: 85, p90: 95 },
      },
      {
        visaType: '491',
        minimumPoints: 65,
        averagePoints: 75,
        percentilePoints: { p50: 70, p75: 80, p90: 90 },
      },
      {
        visaType: '188',
        minimumPoints: 65,
        averagePoints: 80,
        percentilePoints: { p50: 75, p75: 85, p90: 95 },
      },
    ];
  }
}
