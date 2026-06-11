import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { University, Campus, Course } from './entities/university.entity';
import { CreateUniversityDto, UpdateUniversityDto } from './dto/university.dto';
import { CreateCampusDto, UpdateCampusDto } from './dto/campus.dto';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  // Universities
  async findAll() {
    return this.universityRepository.find({
      relations: ['campuses'],
    });
  }

  async findOne(id: string) {
    const university = await this.universityRepository.findOne({
      where: { id },
      relations: ['campuses', 'campuses.courses'],
    });
    if (!university)
      throw new NotFoundException(`University with ID ${id} not found`);
    return university;
  }

  async create(dto: CreateUniversityDto) {
    const university = this.universityRepository.create(dto);
    return this.universityRepository.save(university);
  }

  async update(id: string, dto: UpdateUniversityDto) {
    await this.universityRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.universityRepository.delete(id);
    return { success: true };
  }

  // Campuses
  async getCampuses(universityId: string) {
    return this.campusRepository.find({
      where: { universityId },
    });
  }

  async CreateCampus(dto: CreateCampusDto) {
    const campus = this.campusRepository.create(dto);
    return this.campusRepository.save(campus);
  }

  async updateCampus(id: string, dto: UpdateCampusDto) {
    await this.campusRepository.update(id, dto);
    return this.campusRepository.findOne({ where: { id } });
  }

  async removeCampus(id: string) {
    await this.campusRepository.delete(id);
    return { success: true };
  }

  // Courses
  async findAllCourses(filters: any) {
    const finalFilters = {
      isActive: true,
      ...filters,
    };
    return this.courseRepository.find({
      where: finalFilters,
      relations: ['campus', 'university'],
    });
  }

  async searchCourses(q?: string, anzsco?: string) {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.university', 'university')
      .leftJoinAndSelect('course.campus', 'campus');

    if (q) {
      query.andWhere('course.courseTitle ILIKE :q', { q: `%${q}%` });
    }
    if (anzsco) {
      query.andWhere('course.anzscoCode = :anzsco', { anzsco });
    }

    return query.getMany();
  }

  async createCourse(dto: CreateCourseDto) {
    const course = this.courseRepository.create(dto);
    return this.courseRepository.save(course);
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    await this.courseRepository.update(id, dto);
    return this.courseRepository.findOne({
      where: { id },
      relations: ['university', 'campus'],
    });
  }

  async removeCourse(id: string) {
    await this.courseRepository.delete(id);
    return { success: true };
  }
}
