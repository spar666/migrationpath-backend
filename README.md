# MigrationPath — API

NestJS service behind the MigrationPath web client: eligibility and points
engines, occupation and course search, the consult booking and payment funnel,
and the admin/CMS surface.

## Stack

NestJS 11 · TypeScript · TypeORM + PostgreSQL · Passport JWT · Stripe ·
Calendly webhooks · Nodemailer · Jest.

## Getting started

```bash
npm ci
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET at minimum
npm run migration:run
npm run start:dev         # http://localhost:3000
```

Routes are served under the configured API prefix (`/api/v1` by default).
Swagger UI is at `/docs`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run start:dev` | Watch-mode server |
| `npm run start:prod` | Run the compiled build from `dist/` |
| `npm run build` | `nest build` into `dist/` |
| `npm test` | Jest unit and integration suites |
| `npm run test:cov` | Jest with coverage |
| `npm run test:e2e` | Supertest suites in `test/` |
| `npm run lint` | ESLint with `--fix` |
| `npm run migration:generate -- <name>` | Generate a migration from entity drift |
| `npm run migration:run` / `migration:revert` | Apply / roll back |
| `npm run stripe:doctor` | Check Stripe keys, price and webhook wiring |
| `npm run stripe:price` | Create the consult price object |

## Configuration

Every variable is validated by a Joi schema at boot
(`src/config/config.validation.ts`), so a missing or malformed value fails
startup with a named error rather than surfacing later as a null-pointer.
`.env.example` documents the full set. The groups are:

- **Database** — `DATABASE_URL`, or the discrete `DB_HOST`/`DB_PORT`/`DB_USER`/
  `DB_PASSWORD`/`DB_NAME`/`DB_SSL`
- **Auth** — `JWT_SECRET`, `JWT_EXPIRES_IN`
- **Payments** — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_CONSULT_PRICE_ID`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`,
  `PAYMENT_RECONCILIATION_ENABLED`
- **Booking** — `CALENDLY_WEBHOOK_SIGNING_KEY`
- **Email and alerts** — `SMTP_*`, `LEAD_NOTIFICATION_EMAIL`,
  `SLACK_LEADS_WEBHOOK_URL`
- **CMS** — `STRAPI_URL`, `STRAPI_API_TOKEN`
- **HTTP** — `PORT`, `CORS_ORIGINS`, `TRUST_PROXY`, `THROTTLE_TTL`,
  `THROTTLE_LIMIT`, `ADMIN_BASE_URL`

## Layout

Each domain is a self-contained Nest module — controller, service, DTOs,
entities — registered in `src/app.module.ts`.

```
src/
  auth/ payments/ webhooks/ prospect/ pre-screen/   Funnel: signup to paid consult
  points-engine/ visa-recommendation/               Eligibility scoring
  employer-sponsored/ partner/ parent/              Per-pathway audit engines
  occupations/ courses/ search/ postcode/           Reference data and search
  admin/ cms/ site-config/ policy-config/           Admin and content surface
  common/                                           Filters, interceptors, guards, base repository
  config/                                           Env schema and typed config
  database/                                         Data source, entities, migrations
api/index.ts                                        Vercel serverless entrypoint
test/                                               Supertest end-to-end suites
```

## Deployment

Vercel, via the `api/index.ts` serverless entrypoint declared in
`vercel.json`. `vercel-build` compiles and then runs pending migrations
against the deploy target, so a release ships schema and code together.
