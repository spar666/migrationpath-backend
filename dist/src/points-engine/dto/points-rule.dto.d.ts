export declare class CreatePointsRuleDto {
    visa_group: string;
    category: string;
    sub_category?: string;
    attribute_label?: string;
    min_value?: number;
    max_value?: number;
    points_value: number;
    is_active?: boolean;
}
export declare class UpdatePointsRuleDto {
    visa_group?: string;
    category?: string;
    sub_category?: string;
    attribute_label?: string;
    min_value?: number;
    max_value?: number;
    points_value?: number;
    is_active?: boolean;
}
