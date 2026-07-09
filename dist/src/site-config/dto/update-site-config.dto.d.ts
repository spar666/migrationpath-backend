export declare class PageConfigDto {
    heroHeadline: string;
    heroSubtext: string;
    heroImage?: string;
    primaryCta: string;
    secondaryCta: string;
    benefits?: string[];
}
export declare class HomePageConfigDto extends PageConfigDto {
    outlookTitle: string;
    outlookDescription: string;
    processingTimeHealthcare: string;
    processingTimeTech: string;
}
export declare class FooterConfigDto {
    maraStatement: string;
    quickLinks?: string[];
    resourceLinks?: string[];
}
export declare class UpdateSiteConfigDto {
    home: HomePageConfigDto;
    student: PageConfigDto;
    skilled: PageConfigDto;
    partner: PageConfigDto;
    onshore: PageConfigDto;
    footer: FooterConfigDto;
}
