export declare class CreateCourseDto {
    universityName: string;
    courseTitle: string;
    anzscoCode?: string;
    anzscoTitle?: string;
    annualFees?: number;
    duration?: string;
    isRegional?: boolean;
    isActive?: boolean;
}
declare const UpdateCourseDto_base: import("@nestjs/common").Type<Partial<CreateCourseDto>>;
export declare class UpdateCourseDto extends UpdateCourseDto_base {
}
export {};
