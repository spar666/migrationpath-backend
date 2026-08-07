import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Lets the booking row exist before Calendly's webhook arrives.
 *
 * Checkout needs a booking to attach a payment to. Until now the only thing
 * that created one was the invitee webhook — a server-to-server call that is
 * late under load, silent when misconfigured, and undeliverable in local
 * development where there is no public URL. In all three cases a visitor who
 * had genuinely booked was told there was no time to pay for.
 *
 * The browser now reports the booking too, and this column marks the rows it
 * created so the webhook can correct them instead of duplicating them.
 */
export class AddClientReportedBooking1799000004000 implements MigrationInterface {
  name = 'AddClientReportedBooking1799000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      ADD COLUMN IF NOT EXISTS "client_reported_at" TIMESTAMP WITH TIME ZONE
    `);

    // Supports the adoption lookup: the webhook arrives without knowing our
    // booking id and has to find the row the browser created for that prospect.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_client_reported"
      ON "consultation_bookings" ("prospect_id", "client_reported_at")
      WHERE "client_reported_at" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_bookings_client_reported"
    `);
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      DROP COLUMN IF EXISTS "client_reported_at"
    `);
  }
}
