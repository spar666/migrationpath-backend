import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Occupation } from '../occupations/entities/occupation.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Occupation)
    private readonly occupationRepository: Repository<Occupation>,
  ) {}

  async getStats() {
    const [courses, occupations, universityRows] = await Promise.all([
      this.courseRepository.count(),
      this.occupationRepository.count(),
      this.courseRepository
        .createQueryBuilder('course')
        .select('DISTINCT course.universityName')
        .getRawMany(),
    ]);

    return {
      courses,
      occupations,
      universities: universityRows.length,
    };
  }
}
