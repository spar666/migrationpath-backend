"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBookingInviteeContact1799000006000 = void 0;
class AddBookingInviteeContact1799000006000 {
    name = 'AddBookingInviteeContact1799000006000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      ADD COLUMN IF NOT EXISTS "invitee_email" character varying
    `);
        await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      ADD COLUMN IF NOT EXISTS "invitee_name" character varying
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_invitee_email"
      ON "consultation_bookings" ("invitee_email")
      WHERE "invitee_email" IS NOT NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_bookings_invitee_email"`);
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
exports.AddBookingInviteeContact1799000006000 = AddBookingInviteeContact1799000006000;
//# sourceMappingURL=1799000006000-AddBookingInviteeContact.js.map