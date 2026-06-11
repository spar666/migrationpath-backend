/**
 * Common messages and constants for Strapi integrations.
 * Centralizing all strings to ensure consistency across services.
 */
export const STRAPI_MESSAGES = {
  // --- Success Messages ---
  FETCH_SUCCESS: (entityName: string, count: number) =>
    `Successfully fetched ${count} ${entityName} from Strapi`,

  // --- Error Messages ---
  FORBIDDEN: (entityName: string) =>
    `Strapi Forbidden: Please check permissions for '${entityName}' in the Strapi Admin (Settings -> Roles -> Public)`,

  UNAUTHORIZED: () =>
    `Strapi Unauthorized: Invalid or missing API Token. Please check your STRAPI_API_TOKEN environment variable`,

  NOT_FOUND: (entityName: string) =>
    `Strapi Not Found: The resource '${entityName}' could not be located on the CMS`,

  SERVER_ERROR: (entityName: string) =>
    `Strapi Server Error: Something went wrong on the CMS while fetching '${entityName}'`,

  FETCH_ERROR: (entityName: string, error: string) =>
    `Failed to fetch ${entityName} from Strapi: ${error}`,

  INVALID_DATA: (entityName: string) =>
    `Strapi Data Error: Received malformed data for '${entityName}' from the CMS`,
};
