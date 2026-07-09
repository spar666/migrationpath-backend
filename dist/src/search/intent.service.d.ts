import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { OccupationsService, EligibleVisa } from '../occupations/occupations.service';
export type MigrationIntent = 'SKILLED' | 'STUDENT' | 'FAMILY' | 'UNKNOWN';
export interface SkilledIntentResult {
    intent: 'SKILLED';
    query: string;
    occupation: {
        anzscoCode: string;
        title: string;
        primaryList: string | null;
        assessingAuthority: string | null;
    };
    pointsTested: EligibleVisa[];
    employerSponsored: EligibleVisa[];
}
export interface StudentCourse {
    id: string;
    courseName: string;
    university: string;
    isRegional: boolean;
    anzscoCode: string | null;
    occupation: string | null;
}
export interface StudentIntentResult {
    intent: 'STUDENT';
    query: string;
    courses: StudentCourse[];
}
export interface FamilyIntentResult {
    intent: 'FAMILY';
    query: string;
    matchedKeyword: string;
    redirectTo: string;
}
export interface UnknownIntentResult {
    intent: 'UNKNOWN';
    query: string;
    suggestAudit: true;
    redirectTo: string;
}
export type IntentResult = SkilledIntentResult | StudentIntentResult | FamilyIntentResult | UnknownIntentResult;
export declare class IntentService {
    private readonly occupationsService;
    private readonly courseRepository;
    private readonly logger;
    constructor(occupationsService: OccupationsService, courseRepository: Repository<Course>);
    classify(rawQuery: string): Promise<IntentResult>;
    private matchRelationshipKeyword;
    private findOccupationByTitle;
    private resolveSkilled;
    private findCourses;
    private escapeRegex;
}
