export declare class CreateCourseDto {
    courseTitle: string;
    campusId?: string;
    universityId?: string;
    anzscoCode?: string;
    anzscoTitle?: string;
    qualification?: string;
    annualFees?: number;
    duration?: string;
    isRegionalPointsEligible?: boolean;
    isActive?: boolean;
}
declare const UpdateCourseDto_base: import("@nestjs/common").Type<Partial<CreateCourseDto>>;
export declare class UpdateCourseDto extends UpdateCourseDto_base {
}
export {};
