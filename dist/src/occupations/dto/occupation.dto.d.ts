export declare class CreateOccupationDto {
    anzscoCode: string;
    title: string;
    skillLevel?: number;
    assessingAuthority?: string;
    onMltssl?: boolean;
    onStsol?: boolean;
    onRol?: boolean;
    isActive?: boolean;
    pointsValue?: number;
}
declare const UpdateOccupationDto_base: import("@nestjs/common").Type<Partial<CreateOccupationDto>>;
export declare class UpdateOccupationDto extends UpdateOccupationDto_base {
}
export {};
