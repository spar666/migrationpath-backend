import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeads1787000000000 implements MigrationInterface {
  name = 'CreateLeads1787000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "leads_status_enum" AS ENUM('new', 'contacted', 'converted', 'archived');
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "leads" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "full_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "visa_type" character varying,
        "message" text,
        "package_id" uuid,
        "source" character varying NOT NULL DEFAULT 'other',
        "status" "leads_status_enum" NOT NULL DEFAULT 'new',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leads" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_leads_email" ON "leads" ("email");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_leads_status" ON "leads" ("status");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_leads_created_at" ON "leads" ("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_leads_created_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_leads_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_leads_email";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "leads";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "leads_status_enum";`);
  }
}
