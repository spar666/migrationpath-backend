import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Extra qualifying answers collected by the business pre-screen.
 *
 * The banded columns (`*_band`) store the label the user actually picked
 * rather than a parsed number. A band is a different fact from a figure — an
 * agent reading "$80,000 - $100,000" on the call must not see it rendered back
 * as a precise $80,000 the business never stated. The engine gets a derived
 * numeric separately.
 */
export class AddBusinessQualifyingFields1799000001000 implements MigrationInterface {
  name = 'AddBusinessQualifyingFields1799000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sponsors"
        ADD COLUMN IF NOT EXISTS "business_address" character varying,
        ADD COLUMN IF NOT EXISTS "sponsored_last_5_years" boolean,
        ADD COLUMN IF NOT EXISTS "is_standard_business_sponsor" boolean,
        ADD COLUMN IF NOT EXISTS "annual_revenue_band" character varying(40),
        ADD COLUMN IF NOT EXISTS "years_operating_band" character varying(40),
        ADD COLUMN IF NOT EXISTS "operates_only_in_australia" boolean,
        ADD COLUMN IF NOT EXISTS "employee_count_band" character varying(40),
        ADD COLUMN IF NOT EXISTS "has_temporary_visa_employees" boolean,
        ADD COLUMN IF NOT EXISTS "referral_source" character varying(60);
    `);

    await queryRunner.query(`
      ALTER TABLE "nominations"
        ADD COLUMN IF NOT EXISTS "position_title" character varying,
        ADD COLUMN IF NOT EXISTS "salary_band" character varying(40),
        ADD COLUMN IF NOT EXISTS "candidate_current_pay_band" character varying(40);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "nominations"
        DROP COLUMN IF EXISTS "position_title",
        DROP COLUMN IF EXISTS "salary_band",
        DROP COLUMN IF EXISTS "candidate_current_pay_band";
    `);
    await queryRunner.query(`
      ALTER TABLE "sponsors"
        DROP COLUMN IF EXISTS "business_address",
        DROP COLUMN IF EXISTS "sponsored_last_5_years",
        DROP COLUMN IF EXISTS "is_standard_business_sponsor",
        DROP COLUMN IF EXISTS "annual_revenue_band",
        DROP COLUMN IF EXISTS "years_operating_band",
        DROP COLUMN IF EXISTS "operates_only_in_australia",
        DROP COLUMN IF EXISTS "employee_count_band",
        DROP COLUMN IF EXISTS "has_temporary_visa_employees",
        DROP COLUMN IF EXISTS "referral_source";
    `);
  }
}
