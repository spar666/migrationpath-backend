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
        qualification: string;
        locationType: string;
        visaSubclasses: string[];
        baseProfilePoints: number;
        estimatedPoints: number;
        invitationHistory: import("../invitation/entities/invitation.entity").Invitation[];
        roadmap: {
            step: number;
            label: string;
            description: string;
        }[];
        id: string;
        universityName: string;
        courseTitle: string;
        anzscoCode: string;
        anzscoTitle: string;
        annualFees: number;
        duration: string;
        isRegional: boolean;
        isActive: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    getPathway(id: string, query?: any): Promise<{
        pointsEstimate: import("../points-engine/dto/points.dto").PointsResultDto;
        courseName: string;
        university: string;
        occupation: string;
        qualification: string;
        locationType: string;
        visaSubclasses: string[];
        baseProfilePoints: number;
        estimatedPoints: number;
        invitationHistory: import("../invitation/entities/invitation.entity").Invitation[];
        roadmap: {
            step: number;
            label: string;
            description: string;
        }[];
        id: string;
        universityName: string;
        courseTitle: string;
        anzscoCode: string;
        anzscoTitle: string;
        annualFees: number;
        duration: string;
        isRegional: boolean;
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
