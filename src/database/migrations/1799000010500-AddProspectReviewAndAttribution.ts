import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Additive Prospect metadata. Legal-review questions and operational risks
 * remain independent from statutory eligibility and commercial client fit.
 */
export class AddProspectReviewAndAttribution1799000010500 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prospects"
        ADD COLUMN "rma_review_flags" jsonb NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN "risk_flags" jsonb NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN "attribution" jsonb
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prospects"
        DROP COLUMN "attribution",
        DROP COLUMN "risk_flags",
        DROP COLUMN "rma_review_flags"
    `);
  }
}
