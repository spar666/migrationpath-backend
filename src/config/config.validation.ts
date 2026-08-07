import * as Joi from 'joi';

/**
 * Joi schema for environment variable validation.
 * The app will fail fast at startup with a descriptive error
 * if any required variable is missing or malformed.
 *
 * Every optional string carries `.allow('')`, and that is load-bearing rather
 * than defensive. Joi rejects the empty string by default, dotenv turns
 * `KEY=` into exactly that, and `KEY=` is how .env.example shows a key that
 * exists but has not been filled in yet — so without this, copying the
 * documented starting point to .env produced a server that refused to boot,
 * complaining about a variable the file was never telling you to set.
 *
 * "Optional" here means the value may be absent. It has never meant the value
 * may be nonsense: the Stripe patterns below still apply the moment anything
 * is actually typed in.
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
  //
  // All optional individually because there are two valid ways to spell the
  // same connection: DATABASE_URL alone, or the five DB_* parts. Requiring
  // either set would break the other.
  DATABASE_URL: Joi.string().optional().allow(''),
  DB_HOST: Joi.string().optional().allow(''),
  DB_PORT: Joi.number().port().default(5432),
  DB_USER: Joi.string().optional().allow(''),
  DB_PASSWORD: Joi.string().optional().allow(''),
  DB_NAME: Joi.string().optional().allow(''),
  DB_SSL: Joi.string().valid('true', 'false').default('false'),

  // --- CORS ---
  CORS_ORIGINS: Joi.string().optional().allow(''),

  // --- Reverse proxy (see configuration.ts app.trustProxy for context) ---
  TRUST_PROXY: Joi.string().default('false'),

  // --- Throttle ---
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // --- Strapi ---
  STRAPI_URL: Joi.string().uri().default('http://localhost:1337'),
  STRAPI_API_TOKEN: Joi.string().optional().allow(''),

  // --- Integrations (all optional) ---
  //
  // Optional on purpose: local dev, CI and any environment that does not take
  // payments must still boot. The code fails closed at the point of use
  // instead — an unset Stripe key disables checkout with a 503, an unset
  // Calendly signing key rejects webhooks with a 401. Making these required
  // would mean nobody can run the API without a Stripe account.
  //
  // ⚠️ They ARE effectively required in production. Verify they are set as
  // part of the go-live checklist, not by a schema that blocks local dev.
  // ⚠️ Calendly's OWN signing key, not the Stripe whsec_. The two are the same
  // shape and have been copy-pasted between each other here before. No schema
  // can catch that — both are valid strings — so it is worth checking by eye
  // that these two lines differ.
  CALENDLY_WEBHOOK_SIGNING_KEY: Joi.string().optional().allow(''),

  // Prefixes are checked, values are not. A wrong-shaped key is a typo that
  // boot can catch for free; whether the key is *valid* only Stripe knows, and
  // finding out requires a network call this schema has no business making.
  STRIPE_SECRET_KEY: Joi.string()
    .pattern(/^sk_(test|live)_/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base':
        'STRIPE_SECRET_KEY must start with sk_test_ or sk_live_. ' +
        'A publishable key (pk_) will not authenticate.',
    }),

  STRIPE_WEBHOOK_SECRET: Joi.string()
    .pattern(/^whsec_/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base':
        'STRIPE_WEBHOOK_SECRET must start with whsec_. Take it from the ' +
        'endpoint page in the dashboard, or from `stripe listen` in dev.',
    }),

  // The mistake this catches has already been made twice here: first an amount
  // (`0.01`), then the Product id (`prod_...`). Both fail deep inside a
  // checkout call, where the visitor is told to "try again shortly" — advice
  // that cannot work, for a fault entirely on our side. Boot is the right
  // place to find out.
  STRIPE_CONSULT_PRICE_ID: Joi.string()
    .pattern(/^price_/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base':
        'STRIPE_CONSULT_PRICE_ID must be a Price id starting with price_ — ' +
        'not an amount, and not the prod_ Product id that sits next to it in ' +
        'the dashboard.',
    }),

  STRIPE_SUCCESS_URL: Joi.string().uri().optional().allow(''),
  STRIPE_CANCEL_URL: Joi.string().uri().optional().allow(''),

  // --- Background work ---
  //
  // One instance only. Every instance running its own sweep is the same work
  // repeated against a rate-limited API.
  PAYMENT_RECONCILIATION_ENABLED: Joi.string()
    .valid('true', 'false')
    .default('false'),

  // --- Notifications (all optional — lead alerts no-op if unset) ---
  //
  // These were commented out while configuration.ts went on reading every one
  // of them. Unvalidated is not the same as optional: `allowUnknown` let the
  // values through in whatever shape they arrived, so a malformed SMTP_PORT or
  // a Slack URL with a stray quote failed at the moment an alert was sent —
  // inside a catch that deliberately swallows notifier errors, because a lead
  // must never be lost over a broken Slack hook. The alert simply never
  // arrived, and nothing said why.
  //
  // Optional here means "may be absent". It does not mean "may be nonsense".
  SMTP_HOST: Joi.string().optional().allow(''),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_USER: Joi.string().optional().allow(''),
  SMTP_PASS: Joi.string().optional().allow(''),
  SMTP_FROM: Joi.string().optional().allow(''),

  // `.allow('')` throughout: an empty value in .env is how the example file
  // shows a key exists without setting it, and treating that as a validation
  // failure would make the documented starting point unbootable.
  SLACK_LEADS_WEBHOOK_URL: Joi.string().uri().optional().allow(''),
  LEAD_NOTIFICATION_EMAIL: Joi.string().email().optional().allow(''),
  ADMIN_BASE_URL: Joi.string().uri().optional().allow(''),
});
