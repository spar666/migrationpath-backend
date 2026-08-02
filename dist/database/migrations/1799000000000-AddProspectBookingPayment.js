"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProspectBookingPayment1799000000000 = void 0;
class AddProspectBookingPayment1799000000000 {
    name = 'AddProspectBookingPayment1799000000000';
    async up(queryRunner) {
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
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_prospects_stage_created"
        ON "prospects" ("stage", "created_at" DESC);
    `);
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
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_payments_provider_session_id"
        ON "payments" ("provider_session_id")
        WHERE "provider_session_id" IS NOT NULL;
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_prospect_id"
        ON "payments" ("prospect_id");
    `);
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
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_bookings_scheduler_event_id"
        ON "consultation_bookings" ("scheduler_event_id")
        WHERE "scheduler_event_id" IS NOT NULL;
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_prospect_id"
        ON "consultation_bookings" ("prospect_id");
    `);
        await queryRunner.query(`
      ALTER TYPE "consultation_bookings_status_enum"
        ADD VALUE IF NOT EXISTS 'no_show';
    `);
    }
    async down(queryRunner) {
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
exports.AddProspectBookingPayment1799000000000 = AddProspectBookingPayment1799000000000;
//# sourceMappingURL=1799000000000-AddProspectBookingPayment.js.map