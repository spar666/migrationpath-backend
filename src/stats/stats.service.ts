import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Occupation } from '../occupations/entities/occupation.entity';

/**
 * One honest number.
 *
 * This used to return `courses`, `occupations` and `universities`. Two of the
 * three counted off the `Course` table — `universities` was a
 * `DISTINCT course.universityName` — so both went with the courses module.
 * They are not replaced with zeroes or placeholders: a tile showing a number
 * nothing measures is the problem, not the fix.
 */
@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Occupation)
    private readonly occupationRepository: Repository<Occupation>,
  ) {}

  async getStats() {
    const occupations = await this.occupationRepository.count();
    return { occupations };
  }
}
