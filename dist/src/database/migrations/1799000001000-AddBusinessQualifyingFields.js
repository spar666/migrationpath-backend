"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBusinessQualifyingFields1799000001000 = void 0;
class AddBusinessQualifyingFields1799000001000 {
    name = 'AddBusinessQualifyingFields1799000001000';
    async up(queryRunner) {
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
    async down(queryRunner) {
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
exports.AddBusinessQualifyingFields1799000001000 = AddBusinessQualifyingFields1799000001000;
//# sourceMappingURL=1799000001000-AddBusinessQualifyingFields.js.map