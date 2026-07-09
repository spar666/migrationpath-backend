import { SkilledList } from '../constants/visa-mapping';
export declare class CreateOccupationDto {
    anzscoCode: string;
    title: string;
    description?: string;
    assessingAuthority?: string;
    primaryList?: SkilledList;
    pointsValue?: number;
}
declare const UpdateOccupationDto_base: import("@nestjs/common").Type<Partial<CreateOccupationDto>>;
export declare class UpdateOccupationDto extends UpdateOccupationDto_base {
}
export {};
