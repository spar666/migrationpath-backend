export declare class CreateCampusDto {
    universityId: string;
    campusName: string;
    postcode?: string;
    isRegional?: boolean;
}
declare const UpdateCampusDto_base: import("@nestjs/common").Type<Partial<CreateCampusDto>>;
export declare class UpdateCampusDto extends UpdateCampusDto_base {
}
export {};
