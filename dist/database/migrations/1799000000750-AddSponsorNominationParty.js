"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSponsorNominationParty1799000000750 = void 0;
class AddSponsorNominationParty1799000000750 {
    name = 'AddSponsorNominationParty1799000000750';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sponsors" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "prospect_id" uuid NOT NULL,
        "legal_name" character varying NOT NULL,
        "trading_name" character varying,
        "abn" character varying(20),
        "industry" character varying,
        "employee_count" integer,
        "years_trading" numeric(5,2),
        "state" character varying,
        "postcode" character varying,
        "sponsorship_status" character varying(24) NOT NULL DEFAULT 'unknown',
        "has_adverse_information" boolean,
        "meets_training_obligations" boolean,
        "raw_answers" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sponsors" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sponsors_prospect" FOREIGN KEY ("prospect_id")
          REFERENCES "prospects"("id") ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_sponsors_prospect_id"
        ON "sponsors" ("prospect_id");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_sponsors_abn"
        ON "sponsors" ("abn") WHERE "abn" IS NOT NULL;
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "nominations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sponsor_id" uuid NOT NULL,
        "occupation_code" character varying(12),
        "occupation_name" character varying,
        "subclass" character varying(8),
        "annual_salary" numeric(12,2),
        "work_state" character varying,
        "work_postcode" character varying,
        "is_regional" boolean,
        "lmt_completed" boolean,
        "status" character varying(16) NOT NULL DEFAULT 'draft',
        "applicant_prospect_id" uuid,
        "raw_answers" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_nominations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_nominations_sponsor" FOREIGN KEY ("sponsor_id")
          REFERENCES "sponsors"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_nominations_applicant_prospect"
          FOREIGN KEY ("applicant_prospect_id")
          REFERENCES "prospects"("id") ON DELETE SET NULL
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_nominations_sponsor_id"
        ON "nominations" ("sponsor_id");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_nominations_applicant_prospect_id"
        ON "nominations" ("applicant_prospect_id");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_nominations_open_unmatched"
        ON "nominations" ("status", "created_at" DESC)
        WHERE "applicant_prospect_id" IS NULL;
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_nominations_occupation_code"
        ON "nominations" ("occupation_code")
        WHERE "occupation_code" IS NOT NULL;
    `);
        await queryRunner.query(`
      ALTER TABLE "prospects"
        ADD CONSTRAINT "FK_prospects_sponsor"
        FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE SET NULL;
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_prospects_party"
        ON "prospects" ("party");
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_prospects_party";`);
        await queryRunner.query(`
      ALTER TABLE "prospects" DROP CONSTRAINT IF EXISTS "FK_prospects_sponsor";
    `);
        await queryRunner.query(`DROP TABLE IF EXISTS "nominations";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sponsors";`);
    }
}
exports.AddSponsorNominationParty1799000000750 = AddSponsorNominationParty1799000000750;
//# sourceMappingURL=1799000000750-AddSponsorNominationParty.js.map