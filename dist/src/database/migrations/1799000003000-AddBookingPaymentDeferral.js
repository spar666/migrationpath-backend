"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBookingPaymentDeferral1799000003000 = void 0;
class AddBookingPaymentDeferral1799000003000 {
    name = 'AddBookingPaymentDeferral1799000003000';
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_bookings_payment_deferred"
    `);
        await queryRunner.query(`
      ALTER TABLE "consultation_bookings"
      DROP COLUMN IF EXISTS "payment_deferred_at"
    `);
    }
}
exports.AddBookingPaymentDeferral1799000003000 = AddBookingPaymentDeferral1799000003000;
//# sourceMappingURL=1799000003000-AddBookingPaymentDeferral.js.map