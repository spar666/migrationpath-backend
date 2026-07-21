export declare class InvitationTrend {
    id: string;
    anzsco_code: string;
    round_date: Date;
    subclass: string;
    min_points_invited: number;
    invitations_issued: number;
    source_url: string;
    created_at: Date;
}
export declare class StateNomination {
    id: string;
    state_code: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';
    anzsco_code: string;
    is_open: boolean;
    priority_level: 'high' | 'medium' | 'low';
    additional_requirements: string;
    last_updated: Date;
    created_at: Date;
}
