"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProspectSummary1799000000500 = void 0;
class AddProspectSummary1799000000500 {
    name = 'AddProspectSummary1799000000500';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prospect_summary" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "prospect_id" uuid NOT NULL,
        "headline" text,
        "eligibility" jsonb,
        "answers" jsonb,
        "engine_result" jsonb,
        "sponsorship" jsonb,
        "booking" jsonb,
        "payment" jsonb,
        "refreshed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prospect_summary" PRIMARY KEY ("id"),
        CONSTRAINT "FK_prospect_summary_prospect" FOREIGN KEY ("prospect_id")
          REFERENCES "prospects"("id") ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_prospect_summary_prospect_id"
        ON "prospect_summary" ("prospect_id");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_prospect_summary_eligibility"
        ON "prospect_summary" USING GIN ("eligibility");
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "prospect_summary";`);
    }
}
exports.AddProspectSummary1799000000500 = AddProspectSummary1799000000500;
//# sourceMappingURL=1799000000500-AddProspectSummary.js.map