import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyConfig } from './entities/policy-config.entity';
import { UpdatePolicyConfigDto } from './dto/update-policy-config.dto';

/**
 * Central accessor for admin-editable legislative constants.
 *
 * Engines call `snapshot()` once and read values with a hard-coded fallback, so
 * behaviour is identical to the old constants until an admin edits a row — and
 * a missing/blank config can never break scoring.
 */
@Injectable()
export class PolicyConfigService {
  private cache: Map<string, number> | null = null;

  constructor(
    @InjectRepository(PolicyConfig)
    private readonly repo: Repository<PolicyConfig>,
  ) {}

  private async ensureLoaded(): Promise<Map<string, number>> {
    if (this.cache) return this.cache;
    const rows = await this.repo.find();
    this.cache = new Map(
      rows.filter(r => r.numericValue != null && Number.isFinite(Number(r.numericValue))).map((r) => [r.configKey, Number(r.numericValue)]),
    );
    return this.cache;
  }

  /** Unverified or future employer policy cannot qualify a prospect. */
  async employerSnapshot(): Promise<Map<string, number>> {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await this.repo.find({ where: { category: 'employer' } });
    return new Map(rows.filter(r => r.sourceNote?.trim() && r.effectiveDate && r.effectiveDate <= today && Number.isFinite(Number(r.numericValue)) && Number(r.numericValue) > 0)
      .map(r => [r.configKey, Number(r.numericValue)]));
  }

  /** One-shot map for an engine to read many values without repeated awaits. */
  async snapshot(): Promise<Map<string, number>> {
    return this.ensureLoaded();
  }

  /** Single value with a mandatory fallback (the original hard-coded constant). */
  async getNumber(key: string, fallback: number): Promise<number> {
    const cache = await this.ensureLoaded();
    const value = cache.get(key);
    return typeof value === 'number' && Number.isFinite(value) && (key === 'points.gsmPassMark' || key.endsWith('MaxAge') ? value > 0 : value >= 0) ? value : fallback;
  }

  /**
   * Read a policy value that an engine cannot safely operate without.
   * Missing and malformed values stop the assessment instead of becoming a
   * permissive zero or a stale hard-coded constant.
   */
  async getRequiredNumber(key: string): Promise<number> {
    const cache = await this.ensureLoaded();
    const value = cache.get(key);
    const mustBePositive =
      key === 'points.gsmPassMark' ||
      key.endsWith('MaxAge') ||
      key.startsWith('employer.');

    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      (mustBePositive ? value <= 0 : value < 0)
    ) {
      throw new ServiceUnavailableException(
        `Required policy configuration "${key}" is missing or invalid.`,
      );
    }
    return value;
  }

  /** Helper for reading from an already-fetched snapshot. */
  static num(
    snapshot: Map<string, number>,
    key: string,
    fallback: number,
  ): number {
    const value = snapshot.get(key);
    return typeof value === 'number' && Number.isFinite(value) && (key === 'points.gsmPassMark' || key.endsWith('MaxAge') ? value > 0 : value >= 0) ? value : fallback;
  }

  /**
   * Newest `effective_date` across a category, or null if none is stamped.
   *
   * Backs the "current as of {date}" line shown with a points score. It reads
   * the date an admin recorded rather than a build constant, so confirming the
   * legislation is a config edit and not a deploy.
   */
  async latestEffectiveDate(category: string): Promise<string | null> {
    const rows = await this.repo.find({ where: { category } });
    const dates = rows
      .map((row) => row.effectiveDate)
      .filter((date): date is string => !!date)
      .sort();
    return dates.length ? dates[dates.length - 1] : null;
  }

  async findAll(): Promise<PolicyConfig[]> {
    return this.repo.find({ order: { category: 'ASC', label: 'ASC' } });
  }

  async update(
    configKey: string,
    dto: UpdatePolicyConfigDto,
  ): Promise<PolicyConfig> {
    const existing = await this.repo.findOne({ where: { configKey } });
    if (!existing) {
      throw new NotFoundException(`Policy config "${configKey}" not found`);
    }

    if (dto.numericValue !== undefined) {
      if (!Number.isFinite(dto.numericValue) || dto.numericValue < 0 ||
        ((configKey === 'points.gsmPassMark' || configKey.endsWith('MaxAge') || configKey.startsWith('employer.')) && dto.numericValue <= 0)) {
        throw new BadRequestException('Policy value is outside the supported range.');
      }
      if (configKey.startsWith('employer.') && (!dto.sourceNote?.trim() || !dto.effectiveDate)) {
        throw new BadRequestException('Employer policy changes require a verification source and effective date.');
      }
      existing.numericValue = dto.numericValue;
    }
    if (dto.sourceNote !== undefined) existing.sourceNote = dto.sourceNote;
    if (dto.effectiveDate !== undefined) {
      existing.effectiveDate = dto.effectiveDate;
    }

    const saved = await this.repo.save(existing);
    this.cache = null; // invalidate so the next read reflects the change
    return saved;
  }
}
