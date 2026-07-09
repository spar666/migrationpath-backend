import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSourceMeta } from './entities/data-source-meta.entity';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

export type FreshnessStatus = 'current' | 'review' | 'stale';

export interface FreshnessRow {
  domain: string;
  label: string;
  adminRoute: string | null;
  status: FreshnessStatus;
  lastVerifiedAt: Date | null;
  reviewIntervalDays: number;
  daysSinceVerified: number | null;
  sourceUrl: string | null;
  notes: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class DataFreshnessService {
  constructor(
    @InjectRepository(DataSourceMeta)
    private readonly repo: Repository<DataSourceMeta>,
  ) {}

  private computeStatus(row: DataSourceMeta): {
    status: FreshnessStatus;
    daysSinceVerified: number | null;
  } {
    if (!row.lastVerifiedAt) return { status: 'stale', daysSinceVerified: null };
    const days = Math.floor(
      (Date.now() - new Date(row.lastVerifiedAt).getTime()) / DAY_MS,
    );
    const interval = row.reviewIntervalDays || 90;
    let status: FreshnessStatus;
    if (days > interval) status = 'stale';
    else if (days > interval * 0.75) status = 'review';
    else status = 'current';
    return { status, daysSinceVerified: days };
  }

  async findAll(): Promise<FreshnessRow[]> {
    const rows = await this.repo.find({ order: { label: 'ASC' } });
    return rows.map((r) => {
      const { status, daysSinceVerified } = this.computeStatus(r);
      return {
        domain: r.domain,
        label: r.label,
        adminRoute: r.adminRoute,
        status,
        lastVerifiedAt: r.lastVerifiedAt,
        reviewIntervalDays: r.reviewIntervalDays,
        daysSinceVerified,
        sourceUrl: r.sourceUrl,
        notes: r.notes,
      };
    });
  }

  async markVerified(domain: string): Promise<FreshnessRow> {
    const row = await this.repo.findOne({ where: { domain } });
    if (!row) throw new NotFoundException(`Domain "${domain}" not found`);
    row.lastVerifiedAt = new Date();
    await this.repo.save(row);
    const { status, daysSinceVerified } = this.computeStatus(row);
    return {
      domain: row.domain,
      label: row.label,
      adminRoute: row.adminRoute,
      status,
      lastVerifiedAt: row.lastVerifiedAt,
      reviewIntervalDays: row.reviewIntervalDays,
      daysSinceVerified,
      sourceUrl: row.sourceUrl,
      notes: row.notes,
    };
  }

  async update(
    domain: string,
    dto: UpdateDataSourceDto,
  ): Promise<DataSourceMeta> {
    const row = await this.repo.findOne({ where: { domain } });
    if (!row) throw new NotFoundException(`Domain "${domain}" not found`);
    Object.assign(row, dto);
    return this.repo.save(row);
  }
}
