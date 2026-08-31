import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PointsCaptureService } from './points-capture.service';
import { PointsAggregatorService } from './points-aggregator.service';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { LeadsService } from '../leads/leads.service';
import { PolicyConfigService } from '../policy-config/policy-config.service';

const PROFILE = {
  age: 30,
  englishLevel: 'superior',
  qualification: 'bachelor_masters',
  overseasWorkYears: 5,
  australianWorkYears: 3,
  regionalStudy: true,
} as any;

describe('PointsCaptureService', () => {
  let service: PointsCaptureService;
  let aggregator: { calculateTotalPoints: jest.Mock };
  let prospects: { create: jest.Mock };
  let summaries: { refresh: jest.Mock };
  let leads: { create: jest.Mock };

  const scoreOf = (totalPoints: number) => ({
    totalPoints,
    breakdown: { AGE: 30 },
    workCapApplied: false,
    belowPassMark: totalPoints < 65,
    currentAsOf: '2024-11-16',
    disclaimer: 'General information only, not migration advice.',
  });

  beforeEach(async () => {
    aggregator = {
      calculateTotalPoints: jest.fn().mockResolvedValue(scoreOf(60)),
    };
    prospects = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'p-1', human_ref: 'MP-ABC123' }),
    };
    summaries = { refresh: jest.fn().mockResolvedValue(undefined) };
    leads = { create: jest.fn().mockResolvedValue({ id: 'l-1' }) };

    const policy = {
      getNumber: jest.fn((key: string, fallback: number) =>
        Promise.resolve(
          {
            'points.gsmPassMark': 65,
            'points.stateNominationBonus': 5,
            'points.regionalNominationBonus': 15,
          }[key] ?? fallback,
        ),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsCaptureService,
        { provide: PointsAggregatorService, useValue: aggregator },
        { provide: ProspectService, useValue: prospects },
        { provide: ProspectSummaryService, useValue: summaries },
        { provide: LeadsService, useValue: leads },
        { provide: PolicyConfigService, useValue: policy },
      ],
    }).compile();

    service = module.get(PointsCaptureService);
  });

  const capture = (over: Record<string, unknown> = {}) =>
    service.capture({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      profile: PROFILE,
      consent_given: true,
      ...over,
    } as any);

  it('refuses to store anything without consent', async () => {
    await expect(capture({ consent_given: false })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prospects.create).not.toHaveBeenCalled();
    expect(leads.create).not.toHaveBeenCalled();
  });

  /**
   * The score on the prospect is what an agent opens the call with, so it must
   * be ours. A client-supplied total would let anyone write an arbitrary number
   * onto a record someone then acts on.
   */
  it('recomputes the score from the inputs rather than trusting the caller', async () => {
    const result = await capture({ totalPoints: 999 } as any);
    expect(aggregator.calculateTotalPoints).toHaveBeenCalledWith(PROFILE);
    expect(result.totalPoints).toBe(60);
  });

  it('lands the capture on the shared funnel spine', async () => {
    const result = await capture();

    expect(prospects.create).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'points_calculator',
        visa_interest: 'skilled_189_190_491',
        stage: 'pre_screened',
        consent_given: true,
      }),
    );
    expect(leads.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'points_calculator' }),
    );
    expect(result.prospect_id).toBe('p-1');
    expect(result.human_ref).toBe('MP-ABC123');
    expect(result.can_book).toBe(true);
  });

  it('stores the inputs and the breakdown for the agent, not just a total', async () => {
    await capture();
    expect(summaries.refresh).toHaveBeenCalledWith(
      'p-1',
      expect.objectContaining({
        answers: PROFILE,
        eligibility: expect.objectContaining({
          total_points: 60,
          recommended_subclass: '189/190/491',
        }),
      }),
    );
  });

  it('adds each subclass nomination on top of the applicant score', async () => {
    const { standing } = await capture();
    expect(standing).toEqual([
      {
        subclass: '189',
        nominationPoints: 0,
        effectivePoints: 60,
        meetsPassMark: false,
      },
      {
        subclass: '190',
        nominationPoints: 5,
        effectivePoints: 65,
        meetsPassMark: true,
      },
      {
        subclass: '491',
        nominationPoints: 15,
        effectivePoints: 75,
        meetsPassMark: true,
      },
    ]);
  });

  it('covers only 189/190/491 — no closed or superseded subclass', async () => {
    const { standing } = await capture();
    expect(standing.map((s) => s.subclass)).toEqual(['189', '190', '491']);
  });

  /**
   * Age is a hard bar, not an arithmetic one: a 45-year-old can reach the pass
   * mark on paper and still hold none of these.
   */
  it('reports no subclass as passing once the applicant is over the age limit', async () => {
    aggregator.calculateTotalPoints.mockResolvedValue(scoreOf(90));
    const { standing } = await capture({ profile: { ...PROFILE, age: 45 } });
    expect(standing.every((s) => !s.meetsPassMark)).toBe(true);
  });

  it('marks statutory_eligible when any featured subclass reaches the mark', async () => {
    await capture();
    expect(prospects.create).toHaveBeenCalledWith(
      expect.objectContaining({ statutory_eligible: true, client_fit: null }),
    );
  });

  /**
   * A failed prospect write must not lose the score the person is looking at.
   * They lose the booking button, which an agent can rescue — not the result.
   */
  it('still returns the score when the prospect write fails, with booking off', async () => {
    prospects.create.mockRejectedValue(new Error('db down'));
    const result = await capture();
    expect(result.totalPoints).toBe(60);
    expect(result.can_book).toBe(false);
    expect(result.prospect_id).toBeNull();
  });

  it('does not fail the capture when the lead notification fails', async () => {
    leads.create.mockRejectedValue(new Error('smtp down'));
    const result = await capture();
    expect(result.can_book).toBe(true);
  });
});
