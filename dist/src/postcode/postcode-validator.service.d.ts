import { RegionalPostcodeService } from '../regional-postcode/regional-postcode.service';
export type RegionalCategory = 'METRO' | 'CATEGORY_2' | 'CATEGORY_3' | 'UNKNOWN';
export interface PostcodeClassification {
    postcode: string;
    isRegional: boolean;
    category: RegionalCategory;
    region: string | null;
    points: number;
    needsReview: boolean;
}
export declare class PostcodeValidatorService {
    private readonly regionalPostcodes;
    private readonly logger;
    constructor(regionalPostcodes: RegionalPostcodeService);
    validate(rawPostcode: string | number | null | undefined): PostcodeClassification;
    isRegional(postcode: string | number | null | undefined): boolean;
    private findBand;
    private normalize;
    private pad;
}
