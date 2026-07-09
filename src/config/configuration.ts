/**
 * Centralized configuration factory.
 * Groups environment variables into typed, logical sections.
 */
export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: 'api/v1',
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:3000'],
    // Only relevant when deployed behind a reverse proxy / load balancer.
    // Express's trust proxy setting controls where req.ip (and therefore
    // the ThrottlerGuard's per-IP rate limiting, including the dedicated
    // limit on POST /leads) reads the client IP from. Leaving this off
    // when there IS a proxy in front means everyone behind it shares one
    // rate-limit bucket; turning it on when there ISN'T one means clients
    // can spoof their IP via X-Forwarded-For. Set explicitly — don't guess.
    trustProxy: process.env.TRUST_PROXY || 'false',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    ssl: process.env.DB_SSL,
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    apiToken: process.env.STRAPI_API_TOKEN,
  },
  notifications: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
    },
    slackWebhookUrl: process.env.SLACK_LEADS_WEBHOOK_URL,
    leadNotificationEmail: process.env.LEAD_NOTIFICATION_EMAIL,
    adminBaseUrl: process.env.ADMIN_BASE_URL,
  },
});
