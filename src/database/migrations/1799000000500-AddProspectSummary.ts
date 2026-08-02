import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The agent prep read-model.
 *
 * Separate migration from the spine on purpose: this table is DERIVED. If the
 * shape of the summary needs to change, or the data in it goes stale, you can
 * drop and rebuild this table without touching a single authoritative row.
 * Keeping it in its own migration keeps that option cheap.
 *
 * There is no rebuild job here. Call ProspectSummaryService.refresh(id) — the
 * data is small enough that a loop over prospects is fine when you need one.
 */
export class AddProspectSummary1799000000500 implements MigrationInterface {
  name = 'AddProspectSummary1799000000500';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

    // One summary per prospect — the upsert in the repository relies on this.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_prospect_summary_prospect_id"
        ON "prospect_summary" ("prospect_id");
    `);

    // The agent list view filters on the eligibility flags inside the jsonb.
    // A GIN index makes that containment query usable as the table grows.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_prospect_summary_eligibility"
        ON "prospect_summary" USING GIN ("eligibility");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "prospect_summary";`);
  }
}
