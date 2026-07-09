"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePolicyConfig1794000000000 = void 0;
class CreatePolicyConfig1794000000000 {
    name = 'CreatePolicyConfig1794000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "policy_config" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "config_key" character varying NOT NULL,
        "numeric_value" double precision NOT NULL,
        "label" character varying NOT NULL,
        "description" text,
        "category" character varying NOT NULL,
        "unit" character varying,
        "source_note" text,
        "effective_date" date,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_policy_config" PRIMARY KEY ("id")
      );
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_policy_config_key" ON "policy_config" ("config_key");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_policy_config_category" ON "policy_config" ("category");`);
        const seed = [
            ['points.gsmPassMark', 65, 'GSM Pass Mark', 'points', 'points', 'Minimum points for 189/190/491 invitation eligibility'],
            ['points.combinedWorkCap', 20, 'Combined Work Points Cap', 'points', 'points', 'Maximum combined overseas + Australian work-experience points'],
            ['points.regionalStudyPoints', 5, 'Regional Study Points', 'points', 'points', 'Points for study at a regional campus'],
            ['partner.pillarMax', 100, 'Pillar Maximum', 'partner', 'points', 'Cap applied to each of the four pillars'],
            ['partner.weakThreshold', 75, 'Weak-Pillar Threshold', 'partner', '%', 'Below this a pillar is flagged as weak in recommendations'],
            ['partner.form888Required', 2, 'Form 888 Required', 'partner', 'count', 'Statutory declarations needed to unlock the social bonus'],
            ['partner.jointBankAccounts', 30, 'Financial: Joint Bank Accounts', 'partner', 'points', null],
            ['partner.jointLeaseOrMortgage', 40, 'Financial: Joint Lease/Mortgage', 'partner', 'points', null],
            ['partner.sharedUtilityBills', 30, 'Financial: Shared Utility Bills', 'partner', 'points', null],
            ['partner.sharedDomesticBills', 40, 'Household: Shared Domestic Bills', 'partner', 'points', null],
            ['partner.jointChildResponsibility', 30, 'Household: Joint Child Responsibility', 'partner', 'points', null],
            ['partner.matchingAddressHistory', 30, 'Household: Matching Address History', 'partner', 'points', null],
            ['partner.sharedTravelItineraries', 30, 'Social: Shared Travel Itineraries', 'partner', 'points', null],
            ['partner.form888Points', 40, 'Social: Form 888 Declarations', 'partner', 'points', null],
            ['partner.jointSocialInvitations', 30, 'Social: Joint Social Invitations', 'partner', 'points', null],
            ['partner.livedTogether12Months', 50, 'Commitment: Lived Together 12+ Months', 'partner', 'points', null],
            ['partner.registeredRelationshipBDM', 50, 'Commitment: Registered Relationship (BDM)', 'partner', 'points', null],
            ['parent.sponsorMinMonths', 24, 'Sponsor Minimum Residence', 'parent', 'months', 'Months the sponsoring child must be usually resident in Australia'],
            ['parent.balanceThresholdPct', 50, 'Balance of Family Threshold', 'parent', '%', 'Minimum share of children in Australia (or use the alternative limb)'],
            ['parent.aosSingleBenchmark', 65000, 'Assurance of Support Baseline', 'parent', 'AUD', 'Indicative single-sponsor taxable income baseline for AoS'],
            ['parent.agePensionAge', 67, 'Age Pension Age', 'parent', 'age', 'Age at/above which the Aged Parent (804) track applies'],
        ];
        for (const [key, value, label, category, unit, description] of seed) {
            await queryRunner.query(`INSERT INTO "policy_config" ("config_key","numeric_value","label","category","unit","description")
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT ("config_key") DO NOTHING;`, [key, value, label, category, unit, description]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "policy_config";`);
    }
}
exports.CreatePolicyConfig1794000000000 = CreatePolicyConfig1794000000000;
//# sourceMappingURL=1794000000000-CreatePolicyConfig.js.map