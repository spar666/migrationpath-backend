import { Occupation } from './occupation.entity';
import { Visa } from './visa.entity';
export interface OccupationVisaCaveats {
    incomeThreshold?: number;
    minBusinessSize?: number;
    regionalOnly?: boolean;
    notes?: string;
    [key: string]: unknown;
}
export declare class OccupationVisa {
    id: string;
    occupation_anzsco_code: string;
    visa_id: string;
    caveats: OccupationVisaCaveats | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    occupation: Occupation;
    visa: Visa;
}
