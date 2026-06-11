import { UniversitiesService } from './universities.service';
import { CreateUniversityDto, UpdateUniversityDto } from './dto/university.dto';
import { CreateCampusDto, UpdateCampusDto } from './dto/campus.dto';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
export declare class UniversitiesController {
    private readonly universitiesService;
    constructor(universitiesService: UniversitiesService);
    findAll(): Promise<import("./entities/university.entity").University[]>;
    findOne(id: string): Promise<import("./entities/university.entity").University>;
    create(createUniversityDto: CreateUniversityDto): Promise<import("./entities/university.entity").University>;
    update(id: string, updateUniversityDto: UpdateUniversityDto): Promise<import("./entities/university.entity").University>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getCampuses(id: string): Promise<import("./entities/university.entity").Campus[]>;
    createCampus(createCampusDto: CreateCampusDto): Promise<import("./entities/university.entity").Campus>;
    updateCampus(id: string, updateCampusDto: UpdateCampusDto): Promise<import("./entities/university.entity").Campus | null>;
    removeCampus(id: string): Promise<{
        success: boolean;
    }>;
    findAllCourses(filters: any): Promise<import("./entities/university.entity").Course[]>;
    searchCourses(q: string, anzsco: string): Promise<import("./entities/university.entity").Course[]>;
    createCourse(createCourseDto: CreateCourseDto): Promise<import("./entities/university.entity").Course>;
    updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<import("./entities/university.entity").Course | null>;
    removeCourse(id: string): Promise<{
        success: boolean;
    }>;
}
