import { Repository } from 'typeorm';
import { University, Campus, Course } from './entities/university.entity';
import { CreateUniversityDto, UpdateUniversityDto } from './dto/university.dto';
import { CreateCampusDto, UpdateCampusDto } from './dto/campus.dto';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
export declare class UniversitiesService {
    private readonly universityRepository;
    private readonly campusRepository;
    private readonly courseRepository;
    constructor(universityRepository: Repository<University>, campusRepository: Repository<Campus>, courseRepository: Repository<Course>);
    findAll(): Promise<University[]>;
    findOne(id: string): Promise<University>;
    create(dto: CreateUniversityDto): Promise<University>;
    update(id: string, dto: UpdateUniversityDto): Promise<University>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getCampuses(universityId: string): Promise<Campus[]>;
    CreateCampus(dto: CreateCampusDto): Promise<Campus>;
    updateCampus(id: string, dto: UpdateCampusDto): Promise<Campus | null>;
    removeCampus(id: string): Promise<{
        success: boolean;
    }>;
    findAllCourses(filters: any): Promise<Course[]>;
    searchCourses(q?: string, anzsco?: string): Promise<Course[]>;
    createCourse(dto: CreateCourseDto): Promise<Course>;
    updateCourse(id: string, dto: UpdateCourseDto): Promise<Course | null>;
    removeCourse(id: string): Promise<{
        success: boolean;
    }>;
}
