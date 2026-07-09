import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionalPostcodeBand } from './entities/regional-postcode-band.entity';
import {
  CreateRegionalBandDto,
  UpdateRegionalBandDto,
  BulkImportRegionalBandsDto,
} from './dto/regional-postcode.dto';

export interface RegionBand {
  region: string;
  ranges: [number, number][];
}
export interface BandSet {
  metro: RegionBand[];
  cat2: RegionBand[];
  cat3: RegionBand[];
}

/**
 * Static fallback — the representative bands previously hard-coded in the
 * validator. Used only until the DB table is populated (it is seeded by
 * migration 1796), so the classifier never loses its lookup set.
 */
const STATIC_FALLBACK: BandSet = {
  metro: [
    { region: 'Greater Sydney', ranges: [[2000, 2249], [2555, 2574], [2745, 2786]] },
    { region: 'Greater Melbourne', ranges: [[3000, 3207], [3335, 3341], [3427, 3443], [3750, 3810], [3910, 3944], [3975, 3978], [8000, 8999]] },
    { region: 'Greater Brisbane', ranges: [[4000, 4207], [4300, 4305], [4500, 4519]] },
  ],
  cat2: [
    { region: 'Wollongong / Illawarra', ranges: [[2500, 2534]] },
    { region: 'Newcastle / Lake Macquarie', ranges: [[2280, 2310]] },
    { region: 'Canberra (ACT)', ranges: [[2600, 2620], [2900, 2920]] },
    { region: 'Geelong', ranges: [[3211, 3230]] },
    { region: 'Gold Coast', ranges: [[4208, 4287]] },
    { region: 'Sunshine Coast', ranges: [[4550, 4575]] },
    { region: 'Perth', ranges: [[6000, 6199]] },
    { region: 'Adelaide', ranges: [[5000, 5199]] },
    { region: 'Hobart', ranges: [[7000, 7099]] },
  ],
  cat3: [
    { region: 'Ballarat', ranges: [[3350, 3356]] },
    { region: 'Bendigo', ranges: [[3550, 3556]] },
    { region: 'Toowoomba', ranges: [[4350, 4390]] },
    { region: 'Townsville', ranges: [[4810, 4825]] },
    { region: 'Cairns', ranges: [[4868, 4879]] },
    { region: 'Wagga Wagga', ranges: [[2650, 2652]] },
    { region: 'Albury', ranges: [[2640, 2642]] },
    { region: 'Launceston', ranges: [[7248, 7325]] },
    { region: 'Darwin (NT)', ranges: [[800, 832]] },
  ],
};

@Injectable()
export class RegionalPostcodeService implements OnModuleInit {
  private readonly logger = new Logger(RegionalPostcodeService.name);
  private cache: BandSet | null = null;

  constructor(
    @InjectRepository(RegionalPostcodeBand)
    private readonly repo: Repository<RegionalPostcodeBand>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.reload();
    } catch (err) {
      this.logger.warn(
        `Could not warm regional postcode cache at boot — using static fallback. ${err}`,
      );
    }
  }

  /** Synchronous accessor for the validator (returns DB bands or static fallback). */
  getCachedBands(): BandSet {
    return this.cache ?? STATIC_FALLBACK;
  }

  private async reload(): Promise<void> {
    const rows = await this.repo.find({ where: { isActive: true } });
    if (!rows.length) {
      this.cache = null; // fall back to static
      return;
    }
    const group = (cat: string): RegionBand[] => {
      const byRegion = new Map<string, [number, number][]>();
      rows
        .filter((r) => r.category === cat)
        .forEach((r) => {
          const list = byRegion.get(r.region) ?? [];
          list.push([r.postcodeFrom, r.postcodeTo]);
          byRegion.set(r.region, list);
        });
      return Array.from(byRegion.entries()).map(([region, ranges]) => ({
        region,
        ranges,
      }));
    };
    this.cache = {
      metro: group('METRO'),
      cat2: group('CATEGORY_2'),
      cat3: group('CATEGORY_3'),
    };
  }

  // ---- Admin CRUD ----
  findAll(): Promise<RegionalPostcodeBand[]> {
    return this.repo.find({
      order: { category: 'ASC', postcodeFrom: 'ASC' },
    });
  }

  async create(dto: CreateRegionalBandDto): Promise<RegionalPostcodeBand> {
    const band = this.repo.create({ ...dto, isActive: dto.isActive ?? true });
    const saved = await this.repo.save(band);
    await this.reload();
    return saved;
  }

  async update(
    id: string,
    dto: UpdateRegionalBandDto,
  ): Promise<RegionalPostcodeBand> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Band ${id} not found`);
    Object.assign(existing, dto);
    const saved = await this.repo.save(existing);
    await this.reload();
    return saved;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException(`Band ${id} not found`);
    await this.reload();
    return { success: true };
  }

  async bulkImport(
    dto: BulkImportRegionalBandsDto,
  ): Promise<{ imported: number; deactivated: number }> {
    let deactivated = 0;
    if (dto.replaceAll) {
      const res = await this.repo.update(
        { isActive: true },
        { isActive: false },
      );
      deactivated = res.affected ?? 0;
    }
    const entities = dto.rows.map((r) =>
      this.repo.create({ ...r, isActive: r.isActive ?? true }),
    );
    await this.repo.save(entities);
    await this.reload();
    return { imported: entities.length, deactivated };
  }
}
