import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Keeps the contact details the invitee webhook already receives.
 *
 * Calendly sends the invitee's name and email on every `invitee.created`, and
 * the payload mapper has always pulled them out — then dropped them on the
 * floor. Two consequences, both only visible when something has gone wrong:
 *
 *  1. A booking that arrives with no prospect id (the frontend stopped sending
 *     it, or someone booked from a link that never had it) had NO contact
 *     detail whatsoever. The handler logs that such a row is "recoverable by
 *     matching email addresses", which was not possible — there was no email.
 *
 *  2. A prospect who enquires from one address and books with another cannot
 *     be reconciled by hand, and nothing indicated that was what had happened.
 *
 * Stored alongside the prospect's own email rather than replacing it: the two
 * differing is the fact worth knowing.
 */
export class AddBookingInviteeContact1799000006000 implements MigrationInterface {
  name = 'AddBookingInviteeContact1799000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      ADD COLUMN IF NOT EXISTS "invitee_email" character varying
    `);
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      ADD COLUMN IF NOT EXISTS "invitee_name" character varying
    `);

    // Supports the by-hand reconciliation this column exists for: given an
    // email from a customer asking where their booking went, find the row.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_invitee_email"
      ON "consultation_bookings" ("invitee_email")
      WHERE "invitee_email" IS NOT NULL
    `);

    // Existing rows cannot be backfilled from our own tables — the value only
    // ever existed in the webhook payload. It is still there, in
    // webhook_events.payload, for anyone who needs to recover a specific case.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_bookings_invitee_email"`,
    );
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      DROP COLUMN IF EXISTS "invitee_name"
    `);
    await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      DROP COLUMN IF EXISTS "invitee_email"
    `);
  }
}
