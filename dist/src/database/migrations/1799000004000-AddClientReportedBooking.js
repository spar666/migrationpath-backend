"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddClientReportedBooking1799000004000 = void 0;
class AddClientReportedBooking1799000004000 {
    name = 'AddClientReportedBooking1799000004000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      ADD COLUMN IF NOT EXISTS "client_reported_at" TIMESTAMP WITH TIME ZONE
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_client_reported"
      ON "consultation_bookings" ("prospect_id", "client_reported_at")
      WHERE "client_reported_at" IS NOT NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_bookings_client_reported"
    `);
        await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      DROP COLUMN IF EXISTS "client_reported_at"
    `);
    }
}
exports.AddClientReportedBooking1799000004000 = AddClientReportedBooking1799000004000;
//# sourceMappingURL=1799000004000-AddClientReportedBooking.js.map