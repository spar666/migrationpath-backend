import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crash-safety for the money path.
 *
 * Three independent problems, all of which only show up when something goes
 * wrong at the worst moment:
 *
 *  1. A webhook delivery that was claimed and never finished — a process
 *     restart mid-handler — looked identical to one already processed, so
 *     every retry the provider sent was discarded. The specific loss: Stripe
 *     confirms a payment, we mark it paid, the process dies before the booking
 *     is confirmed, and the booking stays pending forever while the customer
 *     has been charged. `claimed_at` and `attempts` let a stale claim be
 *     retaken.
 *
 *  2. Nothing at the database level stopped two `paid` payments for the same
 *     consultation. The application check is a read followed by a write, which
 *     two concurrent checkouts both pass.
 *
 *  3. Finding a reusable checkout session, or sweeping up abandoned ones,
 *     meant scanning the table.
 */
export class HardenPaymentIdempotency1799000005000 implements MigrationInterface {
  name = 'HardenPaymentIdempotency1799000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- 1. Webhook lease ---
    await queryRunner.query(`
      ALTER TABLE "webhook_events"
      ADD COLUMN IF NOT EXISTS "claimed_at" TIMESTAMP WITH TIME ZONE
    `);
    await queryRunner.query(`
      ALTER TABLE "webhook_events"
      ADD COLUMN IF NOT EXISTS "attempts" integer NOT NULL DEFAULT 0
    `);

    // Existing rows predate the lease. Backfilling `processed` rows with a
    // claim time keeps them out of the retry path; anything else is treated as
    // abandoned and becomes eligible for a retry, which is the safe direction —
    // a repeat of work that was already idempotent costs nothing, and an
    // unfinished payment left alone costs a booking.
    await queryRunner.query(`
      UPDATE "webhook_events"
      SET "claimed_at" = "created_at", "attempts" = 1
      WHERE "claimed_at" IS NULL AND "status" = 'processed'
    `);

    // --- 2. One paid consultation per prospect ---
    //
    // Partial, so the many `created` and `failed` attempts that legitimately
    // exist for one prospect are unaffected. Only `paid` is constrained, which
    // is the row that means money changed hands.
    //
    // Any duplicates already in the table would block this index, so they are
    // demoted to a distinct status first rather than deleted: a payment row is
    // evidence, and if two exist someone needs to look at them.
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

    // --- 3. Lookups for reuse and reconciliation ---
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_open_sessions"
      ON "payments" ("booking_id", "created_at")
      WHERE "status" = 'created'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_payments_open_sessions"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "uq_payments_one_paid_per_purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_events" DROP COLUMN IF EXISTS "attempts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_events" DROP COLUMN IF EXISTS "claimed_at"`,
    );
  }
}
