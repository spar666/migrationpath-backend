export interface StrapiBanner {
    id: number;
    documentId: string;
    title?: string;
    message: string;
    type: 'info' | 'warning' | 'promo';
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    createdAt: string;
    updatedAt: string;
}
export interface StrapiCategory {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}
export interface StrapiFaq {
    id: number;
    documentId: string;
    question: string;
    answer: string;
    category: 'General' | 'Visa' | 'Points' | 'Consultation';
    sort_order?: number;
    persona: 'Skilled' | 'Student' | 'Graduate' | 'All';
    createdAt: string;
    updatedAt: string;
}
export interface StrapiGuide {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    content: string;
    category: 'General' | 'Visa' | 'PR' | 'State';
    persona: 'Skilled' | 'Student' | 'Graduate';
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}
export interface StrapiNewsArticle {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    content: string;
    category: 'Visa' | 'PR Pathway' | 'State Nomination' | 'Other';
    target_persona: 'Skilled' | 'Student' | 'Graduate';
    is_breaking: boolean;
    published_at?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}
export interface StrapiSuccessStory {
    id: number;
    documentId: string;
    name: string;
    country?: string;
    visa_subclass?: string;
    quote: string;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}
export interface StrapiPaginatedResponse<T> {
    data: T[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}
export interface StrapiSingleResponse<T> {
    data: T;
    meta: Record<string, unknown>;
}
