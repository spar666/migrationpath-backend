import * as Joi from '@hapi/joi';

/**
 * Joi schema for environment variable validation.
 * The app will fail fast at startup with a descriptive error
 * if any required variable is missing or malformed.
 */
export const configValidationSchema = Joi.object({
  // --- App ---
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'staging', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // --- JWT ---
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // --- Database ---
  DATABASE_URL: Joi.string().optional(),
  DB_HOST: Joi.string().optional(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().optional(),
  DB_PASSWORD: Joi.string().optional(),
  DB_NAME: Joi.string().optional(),
  DB_SSL: Joi.string().valid('true', 'false').default('false'),

  // --- CORS ---
  CORS_ORIGINS: Joi.string().optional(),

  // --- Throttle ---
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // --- Strapi ---
  STRAPI_URL: Joi.string().uri().default('http://localhost:1337'),
  STRAPI_API_TOKEN: Joi.string().optional(),
});
