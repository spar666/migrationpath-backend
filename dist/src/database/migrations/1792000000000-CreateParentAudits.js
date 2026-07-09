"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateParentAudits1792000000000 = void 0;
class CreateParentAudits1792000000000 {
    name = 'CreateParentAudits1792000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "parent_audits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sponsor_status" character varying NOT NULL,
        "sponsor_months_in_australia" integer NOT NULL,
        "total_children" integer NOT NULL,
        "children_in_australia" integer NOT NULL,
        "children_in_largest_other_country" integer NOT NULL DEFAULT 0,
        "sponsor_taxable_income" integer NOT NULL,
        "parent_age" integer NOT NULL,
        "is_eligible" boolean NOT NULL,
        "status" character varying NOT NULL,
        "balance_percentage" integer NOT NULL,
        "balance_pass" boolean NOT NULL,
        "sponsor_check_pass" boolean NOT NULL,
        "aos_meets_benchmark" boolean NOT NULL,
        "requires_co_assurer" boolean NOT NULL,
        "predicted_subclass" character varying NOT NULL,
        "recommendations" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_parent_audits" PRIMARY KEY ("id")
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_parent_audits_eligible"
        ON "parent_audits" ("is_eligible");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_parent_audits_created_at"
        ON "parent_audits" ("created_at");
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_parent_audits_created_at";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_parent_audits_eligible";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "parent_audits";`);
    }
}
exports.CreateParentAudits1792000000000 = CreateParentAudits1792000000000;
//# sourceMappingURL=1792000000000-CreateParentAudits.js.map