import { Injectable, NotFoundException } from '@nestjs/common';
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
    this.cache = new Map(rows.map((r) => [r.configKey, Number(r.numericValue)]));
    return this.cache;
  }

  /** One-shot map for an engine to read many values without repeated awaits. */
  async snapshot(): Promise<Map<string, number>> {
    return this.ensureLoaded();
  }

  /** Single value with a mandatory fallback (the original hard-coded constant). */
  async getNumber(key: string, fallback: number): Promise<number> {
    const cache = await this.ensureLoaded();
    const value = cache.get(key);
    return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
  }

  /** Helper for reading from an already-fetched snapshot. */
  static num(
    snapshot: Map<string, number>,
    key: string,
    fallback: number,
  ): number {
    const value = snapshot.get(key);
    return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
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

    if (dto.numericValue !== undefined) existing.numericValue = dto.numericValue;
    if (dto.sourceNote !== undefined) existing.sourceNote = dto.sourceNote;
    if (dto.effectiveDate !== undefined) {
      existing.effectiveDate = dto.effectiveDate;
    }

    const saved = await this.repo.save(existing);
    this.cache = null; // invalidate so the next read reflects the change
    return saved;
  }
}
