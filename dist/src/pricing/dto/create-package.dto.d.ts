export declare class CreatePackageDto {
    package_name: string;
    visa_subclass: string;
    category: 'student' | 'skilled' | 'family' | 'employer';
    professional_fees: number;
    government_charges: number;
    estimated_extras: number;
    inclusions: string[];
    is_active?: boolean;
    display_order?: number;
}
