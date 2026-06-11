export declare class Occupation {
    id: string;
    occupation_name: string;
    anzsco_code: string;
    description: string;
    assessing_authority: string;
    points_value: number;
    created_at: Date;
    updated_at: Date;
    thresholds: OccupationThreshold[];
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
