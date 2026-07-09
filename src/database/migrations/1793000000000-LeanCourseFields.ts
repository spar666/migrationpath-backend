import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Lean course model: drop the study-marketing columns (annual_fees, duration).
 * Regional point signal (campus_postcode / is_regional / regional_category) and
 * the occupation link (anzsco_code / anzsco_title) are retained.
 */
export class LeanCourseFields1793000000000 implements MigrationInterface {
  name = 'LeanCourseFields1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN IF EXISTS "annual_fees";`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN IF EXISTS "duration";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "annual_fees" integer NOT NULL DEFAULT 40000;`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "duration" character varying NOT NULL DEFAULT '2 years';`,
    );
  }
}
