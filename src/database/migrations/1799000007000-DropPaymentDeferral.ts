import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes "pay later".
 *
 * The feature offered a visitor the choice of holding their slot and paying
 * afterwards. It was withdrawn because the half that made it work was never
 * built: nothing in this system emails a customer, so "we will email you a link
 * to pay" was a promise with no sender behind it. A held slot nobody is
 * reminded about is not a deferred payment, it is a lost one.
 *
 * The column is dropped rather than left in place. A column nothing reads is
 * debt that outlives the memory of why it is there, and this one shipped and
 * was withdrawn inside a day — there is no history in it worth keeping.
 *
 * `down()` restores the column but not the values. Reversing a migration
 * cannot resurrect data, and pretending otherwise is how a rollback quietly
 * loses information.
 */
export class DropPaymentDeferral1799000007000 implements MigrationInterface {
  name = 'DropPaymentDeferral1799000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_bookings_payment_deferred"
    `);
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      DROP COLUMN IF EXISTS "payment_deferred_at"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      ADD COLUMN IF NOT EXISTS "payment_deferred_at" TIMESTAMP WITH TIME ZONE
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_payment_deferred"
      ON "consultation_bookings" ("payment_deferred_at")
      WHERE "payment_deferred_at" IS NOT NULL
    `);
  }
}
