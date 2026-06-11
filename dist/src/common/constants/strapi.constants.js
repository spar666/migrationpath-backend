"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRAPI_MESSAGES = void 0;
exports.STRAPI_MESSAGES = {
    FETCH_SUCCESS: (entityName, count) => `Successfully fetched ${count} ${entityName} from Strapi`,
    FORBIDDEN: (entityName) => `Strapi Forbidden: Please check permissions for '${entityName}' in the Strapi Admin (Settings -> Roles -> Public)`,
    UNAUTHORIZED: () => `Strapi Unauthorized: Invalid or missing API Token. Please check your STRAPI_API_TOKEN environment variable`,
    NOT_FOUND: (entityName) => `Strapi Not Found: The resource '${entityName}' could not be located on the CMS`,
    SERVER_ERROR: (entityName) => `Strapi Server Error: Something went wrong on the CMS while fetching '${entityName}'`,
    FETCH_ERROR: (entityName, error) => `Failed to fetch ${entityName} from Strapi: ${error}`,
    INVALID_DATA: (entityName) => `Strapi Data Error: Received malformed data for '${entityName}' from the CMS`,
};
//# sourceMappingURL=strapi.constants.js.map