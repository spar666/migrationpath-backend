import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Funnel spine: prospects, payments, webhook_events, plus the columns
 * consultation_bookings needs to hold an anonymous, scheduler-created slot.
 *
 * ⚠️ TRANSACTION CAVEAT — `ALTER TYPE ... ADD VALUE`
 *
 * This migration adds 'no_show' to the existing consultation_bookings status
 * enum. On PostgreSQL before 12, ALTER TYPE ... ADD VALUE cannot run inside a
 * transaction block at all. On 12+ it can, but the new value is not usable in
 * the SAME transaction that added it.
 *
 * This repo runs migrations with `migrationsTransactionMode: 'each'`
 * (see database.module.ts), so each migration gets its own transaction, and
 * this file only ADDS the value without using it — nothing here inserts or
 * compares against 'no_show'. That combination is safe on 12+.
 *
 * If you are on Postgres < 12, or you see
 *   "ALTER TYPE ... ADD cannot run inside a transaction block"
 * run this one statement by hand outside the migration and then re-run:
 *
 *   ALTER TYPE "consultation_bookings_status_enum" ADD VALUE IF NOT EXISTS 'no_show';
 *
 * Do NOT "fix" it by switching the whole run to transactionMode 'none'.
 */
export class AddProspectBookingPayment1799000000000 implements MigrationInterface {
  name = 'AddProspectBookingPayment1799000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------------------------------------------------------------------
    // prospects — the spine
    // ---------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prospects" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "human_ref" character varying(16) NOT NULL,
        "party" character varying(16) NOT NULL DEFAULT 'applicant',
        "full_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "company_name" character varying,
        "stage" character varying(24) NOT NULL DEFAULT 'captured',
        "statutory_eligible" boolean,
        "client_fit" boolean,
        "source" character varying(48) NOT NULL DEFAULT 'unknown',
        "visa_interest" character varying,
        "consent_given" boolean NOT NULL DEFAULT false,
        "consent_text" text,
        "consent_at" TIMESTAMP,
        "user_id" uuid,
        "sponsor_id" uuid,
        "agent_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prospects" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_prospects_human_ref"
        ON "prospects" ("human_ref");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_prospects_email" ON "prospects" ("email");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_prospects_stage" ON "prospects" ("stage");
    `);
    // The agent's working queue: eligible + fit, sorted by recency.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_prospects_stage_created"
        ON "prospects" ("stage", "created_at" DESC);
    `);

    // ---------------------------------------------------------------------
    // payments — local mirror of Stripe, not a ledger
    // ---------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "prospect_id" uuid NOT NULL,
        "booking_id" uuid,
        "purpose" character varying(24) NOT NULL DEFAULT 'consultation',
        "status" character varying(16) NOT NULL DEFAULT 'created',
        "provider" character varying(16) NOT NULL DEFAULT 'stripe',
        "provider_session_id" character varying,
        "provider_payment_intent_id" character varying,
        "amount_cents" integer,
        "currency" character varying(8) NOT NULL DEFAULT 'aud',
        "paid_at" TIMESTAMP WITH TIME ZONE,
        "provider_metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_prospect" FOREIGN KEY ("prospect_id")
          REFERENCES "prospects"("id") ON DELETE CASCADE
      );
    `);
    // Unique, not just indexed: this is what makes the Stripe webhook
    // idempotent when a delivery is retried.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_payments_provider_session_id"
        ON "payments" ("provider_session_id")
        WHERE "provider_session_id" IS NOT NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_prospect_id"
        ON "payments" ("prospect_id");
    `);

    // ---------------------------------------------------------------------
    // webhook_events — idempotency + forensics
    // ---------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "webhook_events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "provider" character varying(24) NOT NULL,
        "external_id" character varying NOT NULL,
        "event_type" character varying(64) NOT NULL,
        "status" character varying(16) NOT NULL DEFAULT 'received',
        "payload" jsonb,
        "error" text,
        "processed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_events" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_webhook_provider_external_id"
          UNIQUE ("provider", "external_id")
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_webhook_events_provider"
        ON "webhook_events" ("provider");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_webhook_events_event_type"
        ON "webhook_events" ("event_type");
    `);

    // ---------------------------------------------------------------------
    // consultation_bookings — anonymous, scheduler-created bookings
    // ---------------------------------------------------------------------

    // user_id becomes nullable: funnel bookings have no account behind them.
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
        ALTER COLUMN "user_id" DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
        ADD COLUMN IF NOT EXISTS "prospect_id" uuid,
        ADD COLUMN IF NOT EXISTS "scheduler_provider" character varying(32),
        ADD COLUMN IF NOT EXISTS "scheduler_event_id" character varying,
        ADD COLUMN IF NOT EXISTS "scheduler_invitee_id" character varying,
        ADD COLUMN IF NOT EXISTS "scheduled_at" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "scheduled_end_at" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "join_url" text,
        ADD COLUMN IF NOT EXISTS "reschedule_url" text,
        ADD COLUMN IF NOT EXISTS "cancel_url" text,
        ADD COLUMN IF NOT EXISTS "cancellation_reason" text;
    `);

    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
        ADD CONSTRAINT "FK_consultation_bookings_prospect"
        FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE SET NULL;
    `);

    // Unique: the invitee URI is the Calendly webhook's idempotency key.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_bookings_scheduler_event_id"
        ON "consultation_bookings" ("scheduler_event_id")
        WHERE "scheduler_event_id" IS NOT NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_prospect_id"
        ON "consultation_bookings" ("prospect_id");
    `);

    // See the transaction caveat at the top of this file.
    await queryRunner.query(`
      ALTER TYPE "consultation_bookings_status_enum"
        ADD VALUE IF NOT EXISTS 'no_show';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: the 'no_show' enum value is NOT removed. Postgres cannot drop a
    // value from an enum type, and rebuilding the type on the way down risks
    // more than it fixes. An unused enum value is harmless.
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_bookings_prospect_id";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_bookings_scheduler_event_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
        DROP CONSTRAINT IF EXISTS "FK_consultation_bookings_prospect";
    `);
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
        DROP COLUMN IF EXISTS "prospect_id",
        DROP COLUMN IF EXISTS "scheduler_provider",
        DROP COLUMN IF EXISTS "scheduler_event_id",
        DROP COLUMN IF EXISTS "scheduler_invitee_id",
        DROP COLUMN IF EXISTS "scheduled_at",
        DROP COLUMN IF EXISTS "scheduled_end_at",
        DROP COLUMN IF EXISTS "join_url",
        DROP COLUMN IF EXISTS "reschedule_url",
        DROP COLUMN IF EXISTS "cancel_url",
        DROP COLUMN IF EXISTS "cancellation_reason";
    `);
    // Only safe if no NULL user_id rows remain — which is why this runs after
    // the funnel columns are gone.
    await queryRunner.query(`
      DELETE FROM "consultation_bookings" WHERE "user_id" IS NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
        ALTER COLUMN "user_id" SET NOT NULL;
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "webhook_events";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prospects";`);
  }
}
