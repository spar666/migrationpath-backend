export declare class University {
    id: string;
    name: string;
    location: string;
    website: string;
    logo_url: string;
    created_at: Date;
    updated_at: Date;
    campuses: Campus[];
}
export declare class Campus {
    id: string;
    universityId: string;
    name: string;
    location: string;
    created_at: Date;
    updated_at: Date;
    university: University;
    courses: Course[];
}
export declare class Course {
    id: string;
    campusId: string;
    universityId: string;
    courseTitle: string;
    anzscoCode: string;
    anzscoTitle: string;
    duration: string;
    qualification: string;
    annualFees: number;
    isRegionalPointsEligible: boolean;
    isActive: boolean;
    created_at: Date;
    updated_at: Date;
    campus: Campus;
    university: University;
}
