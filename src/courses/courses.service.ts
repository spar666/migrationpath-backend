import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { PostcodeValidatorService } from '../postcode/postcode-validator.service';
import { OccupationsService } from '../occupations/occupations.service';

/**
 * Lean course service. The course/university surface is deliberately thin: it
 * links a study option to an occupation (anzscoCode) and carries the regional
 * point signal (campusPostcode -> isRegional). All heavier logic that used to
 * live here — the duplicate dynamic points calculation, the hard-coded roadmap,
 * qualification derivation, and the base-profile-points config lookup — has been
 * removed. Occupation identity and visa eligibility come from the occupations
 * master; points come from the points-engine.
 */
@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly postcodeValidator: PostcodeValidatorService,
    private readonly occupationsService: OccupationsService,
  ) {}

  async findAll(filters?: {
    universityName?: string;
    anzscoCode?: string;
    isActive?: boolean;
  }) {
    const query = this.courseRepository.createQueryBuilder('course');

    if (filters?.universityName) {
      query.andWhere('course.universityName ILIKE :universityName', {
        universityName: `%${filters.universityName}%`,
      });
    }

    if (filters?.anzscoCode) {
      query.andWhere('course.anzscoCode = :anzscoCode', {
        anzscoCode: filters.anzscoCode,
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('course.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    query
      .orderBy('course.universityName', 'ASC')
      .addOrderBy('course.courseTitle', 'ASC');

    return query.getMany();
  }

  /**
   * Lean course detail: the course plus the occupation's eligible visas (from
   * the master) and the derived regional point signal. No roadmap/estimatedPoints
   * enrichment — study-side detail is intentionally minimal.
   */
  async findOne(id: string) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const eligibleVisas = course.anzscoCode
      ? await this.occupationsService.getEligibleVisas(course.anzscoCode)
      : [];

    return {
      ...course,
      courseName: course.courseTitle,
      university: course.universityName,
      occupation: course.anzscoTitle,
      locationType: course.isRegional ? 'Regional' : 'Metropolitan',
      regionalPoints: course.isRegional ? 5 : 0,
      eligibleVisas,
      visaSubclasses: eligibleVisas.map((v) => v.subclassNumber),
    };
  }

  async create(dto: CreateCourseDto) {
    const course = this.courseRepository.create({
      universityName: dto.universityName,
      courseTitle: dto.courseTitle,
      anzscoCode: dto.anzscoCode,
      // Occupation title is denormalised from the master, never entered by hand.
      anzscoTitle: (await this.resolveOccupationTitle(dto.anzscoCode)) ?? undefined,
      isActive: dto.isActive ?? true,
    });

    // Regional status is computed from the postcode, never taken from the client.
    this.applyRegionalClassification(course, dto.campusPostcode);

    return this.courseRepository.save(course);
  }

  async update(id: string, dto: UpdateCourseDto) {
    const existing = await this.courseRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const updateData: Partial<Course> = {};
    if (dto.universityName !== undefined)
      updateData.universityName = dto.universityName;
    if (dto.courseTitle !== undefined) updateData.courseTitle = dto.courseTitle;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    // Re-derive the occupation title from the master whenever the code changes.
    if (dto.anzscoCode !== undefined) {
      updateData.anzscoCode = dto.anzscoCode;
      updateData.anzscoTitle =
        (await this.resolveOccupationTitle(dto.anzscoCode)) ?? undefined;
    }

    // Re-derive regional status whenever the campus postcode is supplied.
    if (dto.campusPostcode !== undefined) {
      this.applyRegionalClassification(updateData, dto.campusPostcode);
    }

    await this.courseRepository.update(id, updateData);
    return this.courseRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    const result = await this.courseRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return { success: true };
  }

  /** Canonical occupation name from the master (single source of truth). */
  private async resolveOccupationTitle(
    anzscoCode?: string,
  ): Promise<string | null> {
    if (!anzscoCode) return null;
    const map = await this.occupationsService.getCanonicalNameMap([anzscoCode]);
    return map[anzscoCode] ?? null;
  }

  /**
   * Derive regional status from the campus postcode. This is the ONLY path that
   * sets isRegional / regionalCategory — the DTO doesn't accept a manual value.
   */
  private applyRegionalClassification(
    course: Partial<Course>,
    campusPostcode: string | null | undefined,
  ): void {
    const classification = this.postcodeValidator.validate(campusPostcode);
    course.campusPostcode = campusPostcode ? classification.postcode : null;
    course.isRegional = classification.isRegional;
    course.regionalCategory = classification.category;
  }
}
