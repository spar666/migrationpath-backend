"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePartnerEligibilitySubmissions1798000000000 = void 0;
class CreatePartnerEligibilitySubmissions1798000000000 {
    name = 'CreatePartnerEligibilitySubmissions1798000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "partner_eligibility_submissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "applicant_first_name" character varying NOT NULL,
        "sponsor_first_name" character varying NOT NULL,
        "completed_by" character varying NOT NULL,
        "email" character varying NOT NULL,
        "applicant_country" character varying NOT NULL,
        "relationship_status" character varying NOT NULL,
        "outcome" character varying NOT NULL,
        "summary" character varying NOT NULL,
        "effort" character varying NOT NULL,
        "high_risk" boolean NOT NULL DEFAULT false,
        "becoming_eligible" boolean NOT NULL DEFAULT false,
        "answers" jsonb NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_partner_eligibility_submissions" PRIMARY KEY ("id")
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_partner_eligibility_email"
        ON "partner_eligibility_submissions" ("email");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_partner_eligibility_outcome"
        ON "partner_eligibility_submissions" ("outcome");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_partner_eligibility_created_at"
        ON "partner_eligibility_submissions" ("created_at");
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "partner_eligibility_submissions";`);
    }
}
exports.CreatePartnerEligibilitySubmissions1798000000000 = CreatePartnerEligibilitySubmissions1798000000000;
//# sourceMappingURL=1798000000000-CreatePartnerEligibilitySubmissions.js.map