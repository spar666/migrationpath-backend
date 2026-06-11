import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { PointsCalculatorService } from '../points-engine/points-calculator/points-calculator.service';
import { PointsResultDto } from '../points-engine/dto/points.dto';
import { PointsConfigRepository } from '../points-engine/points-config.repository';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { Invitation } from '../invitation/entities/invitation.entity';
export declare class CoursesService {
    private readonly courseRepository;
    private readonly invitationRepository;
    private readonly pointsCalculator;
    private readonly pointsConfigRepo;
    constructor(courseRepository: Repository<Course>, invitationRepository: Repository<Invitation>, pointsCalculator: PointsCalculatorService, pointsConfigRepo: PointsConfigRepository);
    findAll(filters?: {
        universityName?: string;
        anzscoCode?: string;
        isActive?: boolean;
    }): Promise<Course[]>;
    findOne(id: string): Promise<{
        courseName: string;
        university: string;
        occupation: string;
        qualification: string;
        locationType: string;
        visaSubclasses: string[];
        baseProfilePoints: number;
        estimatedPoints: number;
        invitationHistory: Invitation[];
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
    getPathwayDetails(id: string, query?: any): Promise<{
        pointsEstimate: PointsResultDto;
        courseName: string;
        university: string;
        occupation: string;
        qualification: string;
        locationType: string;
        visaSubclasses: string[];
        baseProfilePoints: number;
        estimatedPoints: number;
        invitationHistory: Invitation[];
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
    calculateDynamicPoints(id: string, query?: any): Promise<PointsResultDto>;
    private getQualification;
    create(dto: CreateCourseDto): Promise<Course>;
    update(id: string, dto: UpdateCourseDto): Promise<Course | null>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
