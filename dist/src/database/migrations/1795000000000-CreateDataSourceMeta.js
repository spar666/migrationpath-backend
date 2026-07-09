"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDataSourceMeta1795000000000 = void 0;
class CreateDataSourceMeta1795000000000 {
    name = 'CreateDataSourceMeta1795000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "data_source_meta" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "domain" character varying NOT NULL,
        "label" character varying NOT NULL,
        "last_verified_at" TIMESTAMP WITH TIME ZONE,
        "review_interval_days" integer NOT NULL DEFAULT 90,
        "source_url" text,
        "notes" text,
        "admin_route" character varying,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_data_source_meta" PRIMARY KEY ("id")
      );
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_data_source_domain" ON "data_source_meta" ("domain");`);
        const seed = [
            ['invitation_rounds', 'Invitation Rounds', 30, '/admin/invitations'],
            ['policy_config', 'Legislative Settings', 90, '/admin/policy-config'],
            ['regional_postcodes', 'Regional Postcodes', 180, '/admin/regional-postcodes'],
            ['occupation_lists', 'Occupation Lists (MLTSSL/STSOL/ROL/CSOL)', 365, '/admin/occupation-lists'],
        ];
        for (const [domain, label, interval, route] of seed) {
            await queryRunner.query(`INSERT INTO "data_source_meta" ("domain","label","review_interval_days","admin_route")
         VALUES ($1,$2,$3,$4) ON CONFLICT ("domain") DO NOTHING;`, [domain, label, interval, route]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "data_source_meta";`);
    }
}
exports.CreateDataSourceMeta1795000000000 = CreateDataSourceMeta1795000000000;
//# sourceMappingURL=1795000000000-CreateDataSourceMeta.js.map