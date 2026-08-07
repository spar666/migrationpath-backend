"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePartnerAudits1791000000000 = void 0;
class CreatePartnerAudits1791000000000 {
    name = 'CreatePartnerAudits1791000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "partner_audits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "current_location" character varying NOT NULL,
        "joint_bank_accounts" boolean NOT NULL DEFAULT false,
        "joint_lease_or_mortgage" boolean NOT NULL DEFAULT false,
        "shared_utility_bills" boolean NOT NULL DEFAULT false,
        "shared_domestic_bills" boolean NOT NULL DEFAULT false,
        "joint_child_responsibility" boolean NOT NULL DEFAULT false,
        "matching_address_history" boolean NOT NULL DEFAULT false,
        "shared_travel_itineraries" boolean NOT NULL DEFAULT false,
        "form_888_count" integer NOT NULL DEFAULT 0,
        "joint_social_invitations" boolean NOT NULL DEFAULT false,
        "lived_together_12_months" boolean NOT NULL DEFAULT false,
        "registered_relationship_bdm" boolean NOT NULL DEFAULT false,
        "overall_readiness" integer NOT NULL,
        "financial_score" integer NOT NULL,
        "household_score" integer NOT NULL,
        "social_score" integer NOT NULL,
        "commitment_score" integer NOT NULL,
        "commitment_status" character varying NOT NULL,
        "legislative_waiver_applied" boolean NOT NULL DEFAULT false,
        "predicted_subclass" character varying NOT NULL,
        "recommendations" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_partner_audits" PRIMARY KEY ("id")
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_partner_audits_location"
        ON "partner_audits" ("current_location");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_partner_audits_created_at"
        ON "partner_audits" ("created_at");
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_partner_audits_created_at";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_partner_audits_location";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "partner_audits";`);
    }
}
exports.CreatePartnerAudits1791000000000 = CreatePartnerAudits1791000000000;
//# sourceMappingURL=1791000000000-CreatePartnerAudits.js.map