import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Occupation } from '../occupations/entities/occupation.entity';
export declare class StatsService {
    private readonly courseRepository;
    private readonly occupationRepository;
    constructor(courseRepository: Repository<Course>, occupationRepository: Repository<Occupation>);
    getStats(): Promise<{
        courses: number;
        occupations: number;
        universities: number;
    }>;
}
