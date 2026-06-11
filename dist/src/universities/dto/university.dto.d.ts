export declare class CreateUniversityDto {
    name: string;
    cricosProviderCode?: string;
    enrolmentCapReached?: boolean;
    slug?: string;
}
declare const UpdateUniversityDto_base: import("@nestjs/common").Type<Partial<CreateUniversityDto>>;
export declare class UpdateUniversityDto extends UpdateUniversityDto_base {
    isActive?: boolean;
}
export {};
