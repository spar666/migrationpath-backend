export declare const STRAPI_MESSAGES: {
    FETCH_SUCCESS: (entityName: string, count: number) => string;
    FORBIDDEN: (entityName: string) => string;
    UNAUTHORIZED: () => string;
    NOT_FOUND: (entityName: string) => string;
    SERVER_ERROR: (entityName: string) => string;
    FETCH_ERROR: (entityName: string, error: string) => string;
    INVALID_DATA: (entityName: string) => string;
};
