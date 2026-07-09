import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    findAll(universityName?: string, anzscoCode?: string, isActive?: string): Promise<import("./entities/course.entity").Course[]>;
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
    create(createCourseDto: CreateCourseDto): Promise<import("./entities/course.entity").Course>;
    update(id: string, updateCourseDto: UpdateCourseDto): Promise<import("./entities/course.entity").Course | null>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
