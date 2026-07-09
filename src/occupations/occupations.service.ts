import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Occupation, OccupationThreshold } from './entities/occupation.entity';
import { Visa } from './entities/visa.entity';
import { OccupationVisa } from './entities/occupation-visa.entity';
import { UpdateOccupationDto, CreateOccupationDto } from './dto/occupation.dto';
import { SyncVisasDto } from './dto/sync-visas.dto';
import {
  SkilledList,
  resolveEligibleSubclasses,
} from './constants/visa-mapping';

export interface EligibleVisa {
  id: string;
  subclassNumber: string;
  streamTitle: string;
  residencyType: string;
  name: string | null;
  caveats: OccupationVisa['caveats'];
}

export interface OccupationWithVisas extends Occupation {
  eligibleVisas: EligibleVisa[];
}

export interface SyncVisasResult {
  occupationsProcessed: number;
  linksCreated: number;
  linksReactivated: number;
  linksDeactivated: number;
  skippedUnclassified: number;
}

@Injectable()
export class OccupationsService {
  private readonly logger = new Logger(OccupationsService.name);

  constructor(
    @InjectRepository(Occupation)
    private readonly occupationRepository: Repository<Occupation>,
    @InjectRepository(OccupationThreshold)
    private readonly thresholdRepository: Repository<OccupationThreshold>,
    @InjectRepository(Visa)
    private readonly visaRepository: Repository<Visa>,
    @InjectRepository(OccupationVisa)
    private readonly occupationVisaRepository: Repository<OccupationVisa>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filters: Record<string, any>) {
    return this.occupationRepository.find({ where: filters });
  }

  async searchOccupations(query: Record<string, any>) {
    const {
      q,
      assessing_authority,
      state_code,
      is_available,
      page = 1,
      limit = 10,
    } = query;

    const qb = this.occupationRepository.createQueryBuilder('occupation');

    if (q) {
      qb.andWhere(
        '(occupation.occupation_name ILIKE :q OR occupation.anzsco_code ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    if (assessing_authority) {
      qb.andWhere('occupation.assessing_authority = :assessing_authority', {
        assessing_authority,
      });
    }

    if (state_code || is_available !== undefined) {
      qb.innerJoinAndSelect('occupation.thresholds', 'threshold');
      if (state_code) {
        qb.andWhere('threshold.state_code = :state_code', { state_code });
      }
      if (is_available !== undefined) {
        qb.andWhere('threshold.is_available = :is_available', {
          is_available: is_available === 'true' || is_available === true,
        });
      }
    } else {
      qb.leftJoinAndSelect('occupation.thresholds', 'threshold');
    }

    const skip = (Number(page) - 1) * Number(limit);
    qb.skip(skip).take(Number(limit));

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  /**
   * Fetch a single occupation by ANZSCO code together with its active eligible
   * visas. The visa array is produced by an INNER JOIN across the junction so
   * only genuinely linked, active visas are returned. The occupation itself is
   * loaded separately so a valid occupation with zero mappings still resolves
   * (returning an empty eligibleVisas array) rather than 404-ing.
   */
  async findOne(anzscoCode: string): Promise<OccupationWithVisas> {
    const occupation = await this.occupationRepository.findOne({
      where: { anzsco_code: anzscoCode },
      relations: ['thresholds'],
    });

    if (!occupation) {
      throw new NotFoundException(
        `Occupation with ANZSCO ${anzscoCode} not found`,
      );
    }

    const eligibleVisas = await this.getEligibleVisas(anzscoCode);
    return { ...occupation, eligibleVisas };
  }

  /**
   * INNER JOIN the junction table -> visas to return the active eligible visas
   * for an occupation as a flat, frontend-friendly array.
   */
  async getEligibleVisas(anzscoCode: string): Promise<EligibleVisa[]> {
    const rows = await this.occupationVisaRepository
      .createQueryBuilder('ov')
      .innerJoinAndSelect('ov.visa', 'visa')
      .where('ov.occupation_anzsco_code = :anzscoCode', { anzscoCode })
      .andWhere('ov.is_active = :active', { active: true })
      .andWhere('visa.is_active = :active', { active: true })
      .orderBy('visa.subclass_number', 'ASC')
      .getMany();

    return rows.map((row) => ({
      id: row.visa.id,
      subclassNumber: row.visa.subclass_number,
      streamTitle: row.visa.stream_title,
      residencyType: row.visa.residency_type,
      name: row.visa.name,
      caveats: row.caveats,
    }));
  }

  async create(dto: CreateOccupationDto): Promise<OccupationWithVisas> {
    const occupation = this.occupationRepository.create({
      anzsco_code: dto.anzscoCode,
      occupation_name: dto.title,
      description: dto.description ?? null,
      assessing_authority: dto.assessingAuthority ?? null,
      points_value: dto.pointsValue ?? 0,
      primary_list: dto.primaryList ?? null,
    });
    await this.occupationRepository.save(occupation);

    // Resolve visa links immediately on save, per the legislative matrix.
    await this.dataSource.transaction((manager) =>
      this.resolveVisasForOccupation(
        dto.anzscoCode,
        dto.primaryList ?? null,
        manager,
        true,
      ),
    );

    return this.findOne(dto.anzscoCode);
  }

  async update(
    anzscoCode: string,
    dto: UpdateOccupationDto,
  ): Promise<OccupationWithVisas> {
    const existing = await this.occupationRepository.findOne({
      where: { anzsco_code: anzscoCode },
    });
    if (!existing) {
      throw new NotFoundException(
        `Occupation with ANZSCO ${anzscoCode} not found`,
      );
    }

    if (dto.title !== undefined) existing.occupation_name = dto.title;
    if (dto.description !== undefined) existing.description = dto.description;
    if (dto.assessingAuthority !== undefined)
      existing.assessing_authority = dto.assessingAuthority;
    if (dto.pointsValue !== undefined) existing.points_value = dto.pointsValue;

    const listChanged =
      dto.primaryList !== undefined && dto.primaryList !== existing.primary_list;
    if (dto.primaryList !== undefined) existing.primary_list = dto.primaryList;

    await this.occupationRepository.save(existing);

    // Re-resolve links whenever the classifying list changes.
    if (listChanged) {
      await this.dataSource.transaction((manager) =>
        this.resolveVisasForOccupation(
          anzscoCode,
          existing.primary_list,
          manager,
          true,
        ),
      );
    }

    return this.findOne(anzscoCode);
  }

  async remove(anzscoCode: string) {
    const result = await this.occupationRepository.delete({
      anzsco_code: anzscoCode,
    });
    if (!result.affected) {
      throw new NotFoundException(
        `Occupation with ANZSCO ${anzscoCode} not found`,
      );
    }
    return { success: true };
  }

  async getThresholds() {
    return this.thresholdRepository.find({ relations: ['occupation'] });
  }

  /**
   * Canonical anzsco_code -> occupation_name lookup, sourced solely from the
   * occupations master. Other modules (search, points, recommendations) use this
   * instead of trusting occupation labels stored on their own records (e.g.
   * Course.anzscoTitle), so occupation identity has a single source of truth.
   * Pass a subset of codes to limit the query; omit to load the full catalogue.
   */
  async getCanonicalNameMap(
    anzscoCodes?: string[],
  ): Promise<Record<string, string>> {
    const occupations = await this.occupationRepository.find({
      where: anzscoCodes?.length
        ? { anzsco_code: In(anzscoCodes) }
        : {},
      select: ['anzsco_code', 'occupation_name'],
    });

    return occupations.reduce<Record<string, string>>((map, occ) => {
      map[occ.anzsco_code] = occ.occupation_name;
      return map;
    }, {});
  }

  /**
   * Bulk-resolve occupation<->visa links for every classified occupation (or a
   * supplied subset), applying SKILLED_LIST_VISA_MATRIX. Idempotent: safe to run
   * repeatedly. Runs in a single transaction.
   */
  async syncVisas(dto: SyncVisasDto = {}): Promise<SyncVisasResult> {
    const deactivateStale = dto.deactivateStale ?? true;

    return this.dataSource.transaction(async (manager) => {
      const occupationRepo = manager.getRepository(Occupation);

      const occupations = await occupationRepo.find({
        where: dto.anzscoCodes?.length
          ? { anzsco_code: In(dto.anzscoCodes) }
          : {},
      });

      const result: SyncVisasResult = {
        occupationsProcessed: 0,
        linksCreated: 0,
        linksReactivated: 0,
        linksDeactivated: 0,
        skippedUnclassified: 0,
      };

      for (const occupation of occupations) {
        if (!occupation.primary_list) {
          result.skippedUnclassified += 1;
          continue;
        }

        const perOccupation = await this.resolveVisasForOccupation(
          occupation.anzsco_code,
          occupation.primary_list,
          manager,
          deactivateStale,
        );

        result.occupationsProcessed += 1;
        result.linksCreated += perOccupation.created;
        result.linksReactivated += perOccupation.reactivated;
        result.linksDeactivated += perOccupation.deactivated;
      }

      this.logger.log(
        `sync-visas complete: ${JSON.stringify(result)}`,
      );
      return result;
    });
  }

  /**
   * Core resolution routine shared by create/update/sync. Given an occupation
   * and its list, computes the target visa set from the matrix and reconciles
   * the junction rows (create / reactivate / deactivate). Uses the supplied
   * EntityManager so it participates in the caller's transaction.
   */
  private async resolveVisasForOccupation(
    anzscoCode: string,
    primaryList: SkilledList | null,
    manager: EntityManager,
    deactivateStale: boolean,
  ): Promise<{ created: number; reactivated: number; deactivated: number }> {
    const visaRepo = manager.getRepository(Visa);
    const occupationVisaRepo = manager.getRepository(OccupationVisa);

    const targetSubclasses = resolveEligibleSubclasses(primaryList);

    // Map desired subclass numbers -> visa rows (active visas only).
    const targetVisas = targetSubclasses.length
      ? await visaRepo.find({
          where: { subclass_number: In(targetSubclasses), is_active: true },
        })
      : [];
    const targetVisaIds = new Set(targetVisas.map((v) => v.id));

    const existingLinks = await occupationVisaRepo.find({
      where: { occupation_anzsco_code: anzscoCode },
    });
    const existingByVisaId = new Map(
      existingLinks.map((link) => [link.visa_id, link]),
    );

    let created = 0;
    let reactivated = 0;
    let deactivated = 0;

    // Create or reactivate the desired links.
    for (const visa of targetVisas) {
      const existing = existingByVisaId.get(visa.id);
      if (!existing) {
        await occupationVisaRepo.save(
          occupationVisaRepo.create({
            occupation_anzsco_code: anzscoCode,
            visa_id: visa.id,
            is_active: true,
            caveats: null,
          }),
        );
        created += 1;
      } else if (!existing.is_active) {
        existing.is_active = true;
        await occupationVisaRepo.save(existing);
        reactivated += 1;
      }
    }

    // Deactivate links no longer valid under the matrix (caveats preserved).
    if (deactivateStale) {
      for (const link of existingLinks) {
        if (!targetVisaIds.has(link.visa_id) && link.is_active) {
          link.is_active = false;
          await occupationVisaRepo.save(link);
          deactivated += 1;
        }
      }
    }

    return { created, reactivated, deactivated };
  }
}
