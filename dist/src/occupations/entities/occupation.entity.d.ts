import { SkilledList } from '../constants/visa-mapping';
import { OccupationVisa } from './occupation-visa.entity';
export declare class Occupation {
    anzsco_code: string;
    id: string;
    occupation_name: string;
    description: string | null;
    assessing_authority: string | null;
    points_value: number;
    primary_list: SkilledList | null;
    created_at: Date;
    updated_at: Date;
    thresholds: OccupationThreshold[];
    occupationVisas: OccupationVisa[];
}
export declare class OccupationThreshold {
    id: string;
    occupation_id: string;
    state_code: string;
    min_points: number;
    is_available: boolean;
    created_at: Date;
    updated_at: Date;
    occupation: Occupation;
}
