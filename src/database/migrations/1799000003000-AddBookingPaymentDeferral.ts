import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Records that a prospect chose "pay later" at the booking step.
 *
 * A nullable timestamp rather than a boolean: knowing WHEN someone asked for
 * time is what makes the follow-up queue workable — a deferral from this
 * morning and one from three weeks ago are not the same job.
 *
 * It does not add a booking status. `pending` already means unpaid, and only
 * Stripe's webhook may move a booking off it; a second unpaid state would give
 * two places to check before deciding whether someone has actually paid.
 */
export class AddBookingPaymentDeferral1799000003000 implements MigrationInterface {
  name = 'AddBookingPaymentDeferral1799000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      ADD COLUMN IF NOT EXISTS "payment_deferred_at" TIMESTAMP WITH TIME ZONE
    `);

    // Partial index: the rows worth querying are the handful that deferred,
    // not the majority where this is null.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_payment_deferred"
      ON "consultation_bookings" ("payment_deferred_at")
      WHERE "payment_deferred_at" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_bookings_payment_deferred"
    `);
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      DROP COLUMN IF EXISTS "payment_deferred_at"
    `);
  }
}
