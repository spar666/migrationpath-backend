import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDataSourceMeta1795000000000 implements MigrationInterface {
  name = 'CreateDataSourceMeta1795000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "idx_data_source_domain" ON "data_source_meta" ("domain");`,
    );

    // Seed the tracked domains. last_verified_at starts NULL so every domain
    // shows as "needs verification" (red) until an admin confirms it.
    const seed: Array<[string, string, number, string]> = [
      ['invitation_rounds', 'Invitation Rounds', 30, '/admin/invitations'],
      ['policy_config', 'Legislative Settings', 90, '/admin/policy-config'],
      ['regional_postcodes', 'Regional Postcodes', 180, '/admin/regional-postcodes'],
      ['occupation_lists', 'Occupation Lists (MLTSSL/STSOL/ROL/CSOL)', 365, '/admin/occupation-lists'],
    ];
    for (const [domain, label, interval, route] of seed) {
      await queryRunner.query(
        `INSERT INTO "data_source_meta" ("domain","label","review_interval_days","admin_route")
         VALUES ($1,$2,$3,$4) ON CONFLICT ("domain") DO NOTHING;`,
        [domain, label, interval, route],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "data_source_meta";`);
  }
}
