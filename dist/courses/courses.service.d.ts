import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { PostcodeValidatorService } from '../postcode/postcode-validator.service';
import { OccupationsService } from '../occupations/occupations.service';
export declare class CoursesService {
    private readonly courseRepository;
    private readonly postcodeValidator;
    private readonly occupationsService;
    constructor(courseRepository: Repository<Course>, postcodeValidator: PostcodeValidatorService, occupationsService: OccupationsService);
    findAll(filters?: {
        universityName?: string;
        anzscoCode?: string;
        isActive?: boolean;
    }): Promise<Course[]>;
    findOne(id: string): Promise<{
        courseName: string;
        university: string;
        occupation: string;
        locationType: string;
        regionalPoints: number;
        eligibleVisas: import("../occupations/occupations.service").EligibleVisa[];
        visaSubclasses: string[];
        id: string;
        universityName: string;
        courseTitle: string;
        anzscoCode: string;
        anzscoTitle: string;
        campusPostcode: string | null;
        isRegional: boolean;
        regionalCategory: string | null;
        isActive: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    create(dto: CreateCourseDto): Promise<Course>;
    update(id: string, dto: UpdateCourseDto): Promise<Course | null>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    private resolveOccupationTitle;
    private applyRegionalClassification;
}
