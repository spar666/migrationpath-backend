import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PolicyConfigService } from './policy-config.service';
import { PolicyConfig } from './entities/policy-config.entity';

/**
 * Admin-editable legislative constants.
 *
 * The design contract is "a bad config can never break scoring": every read
 * carries the original hard-coded constant as a fallback, so an empty table, a
 * missing key or a non-numeric value all degrade to the previous behaviour
 * rather than to zero. Zero is the dangerous failure — an income threshold of
 * $0 passes everyone.
 *
 * The other thing worth guarding is cache invalidation. The cache is what makes
 * engine reads synchronous-ish, and if an admin edits a threshold and the cache
 * does not clear, the change appears to have been ignored until a redeploy.
 */

describe('PolicyConfigService', () => {
  let service: PolicyConfigService;
  let repo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repo = {
      find: jest.fn().mockResolvedValue([
        { configKey: 'tsmit', numericValue: 73150 },
        { configKey: 'min_age', numericValue: 18 },
      ]),
      findOne: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyConfigService,
        { provide: getRepositoryToken(PolicyConfig), useValue: repo },
      ],
    }).compile();

    service = module.get(PolicyConfigService);
  });

  describe('getNumber', () => {
    it('returns the configured value', async () => {
      await expect(service.getNumber('tsmit', 0)).resolves.toBe(73150);
    });

    it('falls back when the key is absent', async () => {
      await expect(service.getNumber('nonexistent', 999)).resolves.toBe(999);
    });

    it('falls back on an empty table', async () => {
      repo.find.mockResolvedValue([]);
      await expect(service.getNumber('tsmit', 73150)).resolves.toBe(73150);
    });

    it('falls back when the stored value will not parse as a number', async () => {
      // A blank cell in the admin screen becomes NaN. Returning NaN here would
      // make every downstream comparison false — silently failing everyone.
      repo.find.mockResolvedValue([
        { configKey: 'tsmit', numericValue: 'oops' },
      ]);
      await expect(service.getNumber('tsmit', 73150)).resolves.toBe(73150);
    });

    it('keeps a configured zero rather than treating it as missing', async () => {
      // 0 is a legitimate value for some keys, and `||` would swallow it.
      repo.find.mockResolvedValue([{ configKey: 'bonus', numericValue: 0 }]);
      await expect(service.getNumber('bonus', 10)).resolves.toBe(0);
    });
  });

  describe('caching', () => {
    it('reads the table once across many lookups', async () => {
      await service.getNumber('tsmit', 0);
      await service.getNumber('min_age', 0);
      await service.snapshot();

      expect(repo.find).toHaveBeenCalledTimes(1);
    });

    it('re-reads after an update, so an admin edit takes effect', async () => {
      await service.getNumber('tsmit', 0);
      expect(repo.find).toHaveBeenCalledTimes(1);

      repo.findOne.mockResolvedValue({
        configKey: 'tsmit',
        numericValue: 73150,
      });
      await service.update('tsmit', { numericValue: 80000 });

      repo.find.mockResolvedValue([
        { configKey: 'tsmit', numericValue: 80000 },
      ]);
      await expect(service.getNumber('tsmit', 0)).resolves.toBe(80000);
      expect(repo.find).toHaveBeenCalledTimes(2);
    });
  });

  describe('snapshot', () => {
    it('returns every configured key in one map', async () => {
      const snapshot = await service.snapshot();
      expect(snapshot.get('tsmit')).toBe(73150);
      expect(snapshot.get('min_age')).toBe(18);
    });
  });

  describe('static num()', () => {
    it('reads from an already-fetched snapshot', () => {
      const snapshot = new Map([['tsmit', 73150]]);
      expect(PolicyConfigService.num(snapshot, 'tsmit', 0)).toBe(73150);
    });

    it('falls back for a missing or NaN entry', () => {
      const snapshot = new Map([['broken', NaN]]);
      expect(PolicyConfigService.num(snapshot, 'broken', 42)).toBe(42);
      expect(PolicyConfigService.num(snapshot, 'absent', 42)).toBe(42);
    });

    it('keeps a legitimate zero', () => {
      expect(PolicyConfigService.num(new Map([['z', 0]]), 'z', 10)).toBe(0);
    });
  });

  describe('update', () => {
    it('rejects an unknown key rather than creating one', async () => {
      // Keys are defined by the engines that read them. Letting the admin
      // screen invent a key would produce config nothing consults.
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.update('not-a-key', { numericValue: 1 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('applies only the fields supplied', async () => {
      repo.findOne.mockResolvedValue({
        configKey: 'tsmit',
        numericValue: 73150,
        sourceNote: 'original note',
      });

      const saved = await service.update('tsmit', {
        numericValue: 80000,
      });

      expect(saved.numericValue).toBe(80000);
      expect(saved.sourceNote).toBe('original note');
    });

    it('can update the provenance without touching the value', async () => {
      // The source note is the audit trail for a legislative figure — being
      // able to correct it without disturbing the number matters.
      repo.findOne.mockResolvedValue({
        configKey: 'tsmit',
        numericValue: 73150,
        sourceNote: 'old',
      });

      const saved = await service.update('tsmit', {
        sourceNote: 'Home Affairs, July 2026',
      });

      expect(saved.numericValue).toBe(73150);
      expect(saved.sourceNote).toBe('Home Affairs, July 2026');
    });
  });
});
