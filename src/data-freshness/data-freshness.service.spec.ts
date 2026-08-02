import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataFreshnessService } from './data-freshness.service';
import { DataSourceMeta } from './entities/data-source-meta.entity';

/**
 * Staleness tracking for the legislative data the platform scores against.
 *
 * This is the mechanism that stops the site quietly advising people from
 * last year's rules. Its whole value is in the thresholds, so those are what
 * these tests pin — particularly the never-verified case, which must read as
 * stale rather than as fine.
 */

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY);
}

function row(overrides: Partial<DataSourceMeta> = {}): Partial<DataSourceMeta> {
  return {
    domain: 'occupations',
    label: 'Occupation lists',
    adminRoute: '/admin/occupations',
    reviewIntervalDays: 90,
    lastVerifiedAt: daysAgo(1),
    sourceUrl: 'https://immi.homeaffairs.gov.au',
    notes: null,
    ...overrides,
  };
}

describe('DataFreshnessService', () => {
  let service: DataFreshnessService;
  let repo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock };

  async function build(rows: Array<Partial<DataSourceMeta>>) {
    repo = {
      find: jest.fn().mockResolvedValue(rows),
      findOne: jest.fn(),
      save: jest.fn((e) => Promise.resolve(e)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataFreshnessService,
        { provide: getRepositoryToken(DataSourceMeta), useValue: repo },
      ],
    }).compile();

    service = module.get(DataFreshnessService);
  }

  describe('status thresholds', () => {
    it('is current well inside the interval', async () => {
      await build([row({ lastVerifiedAt: daysAgo(10) })]);
      const [result] = await service.findAll();
      expect(result.status).toBe('current');
      expect(result.daysSinceVerified).toBe(10);
    });

    it('warns for review past three quarters of the interval', async () => {
      // 90-day interval, so review starts after 67.5 days.
      await build([row({ lastVerifiedAt: daysAgo(70) })]);
      const [result] = await service.findAll();
      expect(result.status).toBe('review');
    });

    it('is still current at exactly three quarters', async () => {
      // The boundary is `>`, not `>=`. Worth pinning so a refactor does not
      // quietly start nagging a week early.
      await build([row({ lastVerifiedAt: daysAgo(67) })]);
      expect((await service.findAll())[0].status).toBe('current');
    });

    it('is stale past the interval', async () => {
      await build([row({ lastVerifiedAt: daysAgo(120) })]);
      expect((await service.findAll())[0].status).toBe('stale');
    });

    it('is still review at exactly the interval', async () => {
      await build([row({ lastVerifiedAt: daysAgo(90) })]);
      expect((await service.findAll())[0].status).toBe('review');
    });

    it('respects a custom interval', async () => {
      // A 30-day source is stale at 40 days even though a 90-day one is not.
      await build([
        row({ reviewIntervalDays: 30, lastVerifiedAt: daysAgo(40) }),
      ]);
      expect((await service.findAll())[0].status).toBe('stale');
    });

    it('treats a zero interval as the 90-day default', async () => {
      // Otherwise a blank admin field would divide the logic by zero and mark
      // everything permanently stale.
      await build([
        row({ reviewIntervalDays: 0, lastVerifiedAt: daysAgo(10) }),
      ]);
      expect((await service.findAll())[0].status).toBe('current');
    });
  });

  describe('never verified', () => {
    it('reads as stale, not as current', async () => {
      // The dangerous default. A source nobody has ever checked is the least
      // trustworthy one, so absence of a date must not look like freshness.
      await build([row({ lastVerifiedAt: null })]);
      const [result] = await service.findAll();

      expect(result.status).toBe('stale');
      expect(result.daysSinceVerified).toBeNull();
    });
  });

  describe('the payload', () => {
    it('carries the admin route so a stale row is actionable', async () => {
      // A dashboard that says "this is stale" without saying where to fix it
      // gets ignored.
      await build([row()]);
      const [result] = await service.findAll();

      expect(result.adminRoute).toBe('/admin/occupations');
      expect(result.sourceUrl).toBe('https://immi.homeaffairs.gov.au');
      expect(result.label).toBe('Occupation lists');
    });

    it('reports every source, not just the problem ones', async () => {
      await build([
        row({ domain: 'a', lastVerifiedAt: daysAgo(1) }),
        row({ domain: 'b', lastVerifiedAt: daysAgo(200) }),
        row({ domain: 'c', lastVerifiedAt: null }),
      ]);

      const results = await service.findAll();
      expect(results).toHaveLength(3);
      expect(results.map((r) => r.status)).toEqual([
        'current',
        'stale',
        'stale',
      ]);
    });

    it('returns an empty list rather than throwing when nothing is tracked', async () => {
      await build([]);
      await expect(service.findAll()).resolves.toEqual([]);
    });
  });
});
