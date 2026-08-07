"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.configValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.configValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'staging', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('7d'),
    DATABASE_URL: Joi.string().optional().allow(''),
    DB_HOST: Joi.string().optional().allow(''),
    DB_PORT: Joi.number().port().default(5432),
    DB_USER: Joi.string().optional().allow(''),
    DB_PASSWORD: Joi.string().optional().allow(''),
    DB_NAME: Joi.string().optional().allow(''),
    DB_SSL: Joi.string().valid('true', 'false').default('false'),
    CORS_ORIGINS: Joi.string().optional().allow(''),
    TRUST_PROXY: Joi.string().default('false'),
    THROTTLE_TTL: Joi.number().default(60000),
    THROTTLE_LIMIT: Joi.number().default(100),
    STRAPI_URL: Joi.string().uri().default('http://localhost:1337'),
    STRAPI_API_TOKEN: Joi.string().optional().allow(''),
    CALENDLY_WEBHOOK_SIGNING_KEY: Joi.string().optional().allow(''),
    STRIPE_SECRET_KEY: Joi.string()
        .pattern(/^sk_(test|live)_/)
        .optional()
        .allow('')
        .messages({
        'string.pattern.base': 'STRIPE_SECRET_KEY must start with sk_test_ or sk_live_. ' +
            'A publishable key (pk_) will not authenticate.',
    }),
    STRIPE_WEBHOOK_SECRET: Joi.string()
        .pattern(/^whsec_/)
        .optional()
        .allow('')
        .messages({
        'string.pattern.base': 'STRIPE_WEBHOOK_SECRET must start with whsec_. Take it from the ' +
            'endpoint page in the dashboard, or from `stripe listen` in dev.',
    }),
    STRIPE_CONSULT_PRICE_ID: Joi.string()
        .pattern(/^price_/)
        .optional()
        .allow('')
        .messages({
        'string.pattern.base': 'STRIPE_CONSULT_PRICE_ID must be a Price id starting with price_ — ' +
            'not an amount, and not the prod_ Product id that sits next to it in ' +
            'the dashboard.',
    }),
    STRIPE_SUCCESS_URL: Joi.string().uri().optional().allow(''),
    STRIPE_CANCEL_URL: Joi.string().uri().optional().allow(''),
    PAYMENT_RECONCILIATION_ENABLED: Joi.string()
        .valid('true', 'false')
        .default('false'),
    SMTP_HOST: Joi.string().optional().allow(''),
    SMTP_PORT: Joi.number().port().default(587),
    SMTP_USER: Joi.string().optional().allow(''),
    SMTP_PASS: Joi.string().optional().allow(''),
    SMTP_FROM: Joi.string().optional().allow(''),
    SLACK_LEADS_WEBHOOK_URL: Joi.string().uri().optional().allow(''),
    LEAD_NOTIFICATION_EMAIL: Joi.string().email().optional().allow(''),
    ADMIN_BASE_URL: Joi.string().uri().optional().allow(''),
});
//# sourceMappingURL=config.validation.js.map