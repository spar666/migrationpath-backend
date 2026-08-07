"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardenPaymentIdempotency1799000005000 = void 0;
class HardenPaymentIdempotency1799000005000 {
    name = 'HardenPaymentIdempotency1799000005000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "webhook_events"
      ADD COLUMN IF NOT EXISTS "claimed_at" TIMESTAMP WITH TIME ZONE
    `);
        await queryRunner.query(`
      ALTER TABLE "webhook_events"
      ADD COLUMN IF NOT EXISTS "attempts" integer NOT NULL DEFAULT 0
    `);
        await queryRunner.query(`
      UPDATE "webhook_events"
      SET "claimed_at" = "created_at", "attempts" = 1
      WHERE "claimed_at" IS NULL AND "status" = 'processed'
    `);
        await queryRunner.query(`
      UPDATE "payments" p
      SET "status" = 'duplicate'
      WHERE p."status" = 'paid'
        AND EXISTS (
          SELECT 1 FROM "payments" q
          WHERE q."prospect_id" = p."prospect_id"
            AND q."purpose" = p."purpose"
            AND q."status" = 'paid'
            AND (q."paid_at" < p."paid_at"
                 OR (q."paid_at" = p."paid_at" AND q."id" < p."id"))
        )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_payments_one_paid_per_purpose"
      ON "payments" ("prospect_id", "purpose")
      WHERE "status" = 'paid'
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_open_sessions"
      ON "payments" ("booking_id", "created_at")
      WHERE "status" = 'created'
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_open_sessions"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "uq_payments_one_paid_per_purpose"`);
        await queryRunner.query(`ALTER TABLE "webhook_events" DROP COLUMN IF EXISTS "attempts"`);
        await queryRunner.query(`ALTER TABLE "webhook_events" DROP COLUMN IF EXISTS "claimed_at"`);
    }
}
exports.HardenPaymentIdempotency1799000005000 = HardenPaymentIdempotency1799000005000;
//# sourceMappingURL=1799000005000-HardenPaymentIdempotency.js.map