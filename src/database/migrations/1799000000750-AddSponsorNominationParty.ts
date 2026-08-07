import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The two-party employer-sponsored model.
 *
 *   prospect(business) --1:1--> sponsor --1:N--> nomination
 *                                                    |
 *                                          applicant_prospect_id
 *                                                    |
 *                                          prospect(applicant)
 *
 * `nominations.applicant_prospect_id` is the join that closes the two-sided
 * funnel: a business posts a role, an applicant pre-screens separately, and an
 * agent matches them. It stays NULL until that match is made — the public
 * questionnaire never sets it.
 *
 * Runs last of the three because it adds the FK from prospects.sponsor_id,
 * which needs the sponsors table to exist.
 */
export class AddSponsorNominationParty1799000000750 implements MigrationInterface {
  name = 'AddSponsorNominationParty1799000000750';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
    // ABN is not unique — the same business can legitimately appear twice
    // (a re-enquiry months later), and deduping is an agent decision, not a
    // constraint. Indexed so that lookup is fast when they do.
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
    // The agent's matching queue: open roles with nobody attached yet.
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

    // Now that sponsors exists, the spine can point at it.
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_prospects_party";`);
    await queryRunner.query(`
      ALTER TABLE "prospects" DROP CONSTRAINT IF EXISTS "FK_prospects_sponsor";
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "nominations";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sponsors";`);
  }
}
