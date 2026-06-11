import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Occupation, OccupationThreshold } from './entities/occupation.entity';
import { UpdateOccupationDto, CreateOccupationDto } from './dto/occupation.dto';

@Injectable()
export class OccupationsService {
  constructor(
    @InjectRepository(Occupation)
    private readonly occupationRepository: Repository<Occupation>,
    @InjectRepository(OccupationThreshold)
    private readonly thresholdRepository: Repository<OccupationThreshold>,
  ) {}

  async findAll(filters: any) {
    return this.occupationRepository.find({
      where: filters,
    });
  }

  async searchOccupations(query: any) {
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

  async findOne(anzscoCode: string) {
    const occupation = await this.occupationRepository.findOne({
      where: { anzsco_code: anzscoCode },
      relations: ['thresholds'],
    });
    if (!occupation)
      throw new NotFoundException(
        `Occupation with ANZSCO ${anzscoCode} not found`,
      );
    return occupation;
  }

  async create(dto: CreateOccupationDto) {
    const occupation = this.occupationRepository.create({
      occupation_name: dto.title,
      anzsco_code: dto.anzscoCode,
      assessing_authority: dto.assessingAuthority,
      points_value: dto.pointsValue ?? 0,
    } as any);
    return this.occupationRepository.save(occupation);
  }

  async update(id: string, dto: UpdateOccupationDto) {
    const updateData: any = {};
    if (dto.title) updateData.occupation_name = dto.title;
    if (dto.anzscoCode) updateData.anzsco_code = dto.anzscoCode;
    if (dto.assessingAuthority)
      updateData.assessing_authority = dto.assessingAuthority;
    if (dto.pointsValue !== undefined)
      updateData.points_value = dto.pointsValue;

    await this.occupationRepository.update(id, updateData);
    return this.occupationRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    await this.occupationRepository.delete(id);
    return { success: true };
  }

  async getThresholds() {
    return this.thresholdRepository.find({
      relations: ['occupation'],
    });
  }
}
