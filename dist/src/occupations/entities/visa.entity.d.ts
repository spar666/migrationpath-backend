import { VisaResidencyType } from '../constants/visa-mapping';
import { OccupationVisa } from './occupation-visa.entity';
export declare class Visa {
    id: string;
    subclass_number: string;
    stream_title: string;
    residency_type: VisaResidencyType;
    name: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    occupationVisas: OccupationVisa[];
}
