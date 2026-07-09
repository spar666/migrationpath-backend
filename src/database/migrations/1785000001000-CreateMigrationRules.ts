import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMigrationRules1785000001000 implements MigrationInterface {
  name = 'CreateMigrationRules1785000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "migration_rules" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "persona_type" character varying NOT NULL,
        "document_name" character varying NOT NULL,
        "description" text,
        "is_mandatory" boolean DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_migration_rules_persona_type" ON "migration_rules" ("persona_type");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_migration_rules_persona_type";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "migration_rules";`);
  }
}
